import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PasswordService } from './services/password.service';
import { TokenService } from './services/token.service';
import { type RegisterDto } from './dto/register.dto';
import { type LoginDto } from './dto/login.dto';
import { type ForgotPasswordDto } from './dto/forgot-password.dto';
import { type ResetPasswordDto } from './dto/reset-password.dto';
import { Role, Prisma } from '@prisma/client';

export interface AuthResult {
  user: {
    id: string;
    email: string;
    username: string | null;
    name: string | null;
    role: Role;
    isActive: boolean;
    isEmailVerified: boolean;
    createdAt: Date;
    profile: {
      bio: string | null;
      headline: string | null;
      avatarUrl: string | null;
      college: string | null;
      gradYear: number | null;
      location: string | null;
      skills: string[];
    } | null;
  };
  accessToken: string;
  refreshToken?: string;
  sessionId?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
  ) {}

  /**
   * Registers a new user with default STUDENT role and initializes their profile.
   */
  async register(
    dto: RegisterDto,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<AuthResult> {
    const email = dto.email.toLowerCase().trim();
    const username = dto.username ? dto.username.toLowerCase().trim() : null;

    // Check duplicate email
    const existingEmail = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingEmail) {
      throw new ConflictException('An account with this email address already exists');
    }

    // Check duplicate username if provided
    if (username) {
      const existingUsername = await this.prisma.user.findUnique({
        where: { username },
      });
      if (existingUsername) {
        throw new ConflictException('This username is already taken');
      }
    }

    // Hash password with Argon2id
    const passwordHash = await this.passwordService.hash(dto.password);

    try {
      // Create user and profile in transaction
      const newUser = await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email,
            username,
            name: dto.name || null,
            passwordHash,
            role: Role.STUDENT, // Explicitly enforce default role
            isActive: true,
            isEmailVerified: false,
          },
        });

        const profile = await tx.profile.create({
          data: {
            userId: user.id,
            college: dto.college || null,
            gradYear: dto.gradYear || null,
            skills: [],
          },
        });

        return { ...user, profile };
      });

      // Generate credentials & session
      const { accessToken, refreshToken } = await this.createTokenPair(
        newUser.id,
        newUser.email,
        newUser.username,
        newUser.role,
        userAgent,
        ipAddress,
      );

      return {
        user: this.sanitizeUser(newUser),
        accessToken,
        refreshToken,
      };
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        const target = (err.meta?.['target'] as string[]) || [];
        if (target.includes('email')) {
          throw new ConflictException('An account with this email address already exists');
        }
        if (target.includes('username')) {
          throw new ConflictException('This username is already taken');
        }
      }
      throw err;
    }
  }

  /**
   * Authenticates user via email or username and establishes a refresh-token session.
   */
  async login(
    dto: LoginDto,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<AuthResult> {
    const identifier = dto.identifier.toLowerCase().trim();

    // Query user by email OR username
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
      },
      include: {
        profile: true,
      },
    });

    // Constant-time check mitigation
    if (!user || !user.passwordHash) {
      await this.passwordService.verify(
        '$argon2id$v=19$m=19456,t=2,p=1$dummyhashfortimingdefense$dummyhashfortimingdefense',
        dto.password,
      );
      throw new UnauthorizedException('Invalid email/username or password');
    }

    const isMatch = await this.passwordService.verify(user.passwordHash, dto.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email/username or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('This account has been deactivated. Please contact support.');
    }

    const { accessToken, refreshToken } = await this.createTokenPair(
      user.id,
      user.email,
      user.username,
      user.role,
      userAgent,
      ipAddress,
    );

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  /**
  /**
   * Rotates refresh token with bounded atomic concurrency control and reuse detection.
   * - Bounded loop (maximum 2 attempts) eliminates all unbounded recursive calls.
   * - Strict conditional check: Only the request that wins updateMany(affected rows > 0) creates the successor.
   * - Grace window (15s): Legitimate concurrent requests receive an access token without repeatedly minting new refresh tokens.
   * - Replay defense (>15s): Entire token family and session are revoked immediately.
   */
  async refresh(
    refreshTokenRaw: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<AuthResult> {
    if (!refreshTokenRaw) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const tokenHash = this.tokenService.hashToken(refreshTokenRaw);
    const REFRESH_GRACE_PERIOD_MS = 15 * 1000; // 15-second grace window for concurrent requests
    const MAX_ROTATION_ATTEMPTS = 2;

    for (let attempt = 1; attempt <= MAX_ROTATION_ATTEMPTS; attempt++) {
      const now = Date.now();

      const tokenRecord = await this.prisma.refreshToken.findUnique({
        where: { tokenHash },
        include: {
          session: true,
          user: {
            include: { profile: true },
          },
        },
      });

      if (!tokenRecord) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      // Check for token revocation / replacement
      if (tokenRecord.isRevoked || tokenRecord.replacedByTokenHash) {
        if (tokenRecord.replacedByTokenHash) {
          const successor = await this.prisma.refreshToken.findUnique({
            where: { tokenHash: tokenRecord.replacedByTokenHash },
            include: { session: true },
          });

          const IDLE_TIMEOUT_MS = 7 * 24 * 60 * 60 * 1000;

          // 1. Consistency: Successor must belong to the exact same family, user, and session
          const isConsistent =
            Boolean(successor) &&
            successor?.family === tokenRecord.family &&
            successor?.userId === tokenRecord.userId &&
            successor?.sessionId === tokenRecord.sessionId;

          // 2. Successor Token State: Must not be revoked, must NOT be replaced/rotated itself, and must not be expired
          const isSuccessorValid =
            Boolean(successor) &&
            !successor?.isRevoked &&
            successor?.replacedByTokenHash === null && // Never allow a consumed token whose successor was already rotated
            Boolean(successor?.expiresAt && successor.expiresAt.getTime() > now);

          // 3. Session State: If linked, session must be active, not revoked, within absolute 30-day max, and not idle
          const isSessionValid =
            Boolean(successor) &&
            (!successor?.session ||
              (!successor.session.isRevoked &&
                successor.session.expiresAt.getTime() > now &&
                (!successor.session.lastActivityAt ||
                  now - successor.session.lastActivityAt.getTime() <= IDLE_TIMEOUT_MS)));

          // 4. User and Timing: User must be active and request within legitimate 15-second grace window
          const isWithinGrace =
            Boolean(successor) &&
            isConsistent &&
            isSuccessorValid &&
            isSessionValid &&
            tokenRecord.user.isActive &&
            now - successor!.createdAt.getTime() <= REFRESH_GRACE_PERIOD_MS;

          if (isWithinGrace) {
            this.logger.log(
              `Concurrent refresh within ${now - successor!.createdAt.getTime()}ms grace window for user ${tokenRecord.userId}. Re-issuing access credentials.`,
            );

            // Do NOT mint additional refresh tokens. Return access token for the active session.
            const accessToken = this.tokenService.generateAccessToken({
              sub: tokenRecord.user.id,
              email: tokenRecord.user.email,
              username: tokenRecord.user.username,
              role: tokenRecord.user.role,
              sid: tokenRecord.sessionId || undefined,
            });

            return {
              user: this.sanitizeUser(tokenRecord.user),
              accessToken,
              sessionId: tokenRecord.sessionId || undefined,
            };
          }
        }

        // Beyond grace window, successor revoked, or successor already rotated: Replay attack detected!
        this.logger.warn(
          `🚨 Security Alert: Refresh token reuse/replay detected for user ${tokenRecord.userId}, family ${tokenRecord.family}. Revoking session and token family.`,
        );
        await this.prisma.$transaction([
          this.prisma.refreshToken.updateMany({
            where: { family: tokenRecord.family },
            data: { isRevoked: true },
          }),
          ...(tokenRecord.sessionId
            ? [
                this.prisma.session.updateMany({
                  where: { id: tokenRecord.sessionId, isRevoked: false },
                  data: { isRevoked: true, revokedAt: new Date(now) },
                }),
              ]
            : []),
        ]);
        throw new UnauthorizedException('Security violation: token reuse detected. Please log in again.');
      }

      // Check token expiration
      if (tokenRecord.expiresAt < new Date(now)) {
        throw new UnauthorizedException('Refresh token has expired');
      }

      // Check session status if linked
      if (tokenRecord.session) {
        if (tokenRecord.session.isRevoked) {
          throw new UnauthorizedException('Session has been revoked');
        }

        // Absolute session ceiling (30 days from establishment)
        if (tokenRecord.session.expiresAt.getTime() <= now) {
          throw new UnauthorizedException('Session has reached its maximum lifetime. Please log in again.');
        }

        // Idle expiration (7 days of inactivity)
        const IDLE_TIMEOUT_MS = 7 * 24 * 60 * 60 * 1000;
        if (now - tokenRecord.session.lastActivityAt.getTime() > IDLE_TIMEOUT_MS) {
          throw new UnauthorizedException('Session has expired due to inactivity. Please log in again.');
        }
      }

      const user = tokenRecord.user;
      if (!user.isActive) {
        throw new UnauthorizedException('User account has been deactivated');
      }

      // Rotate: Issue new refresh token in the same family and revoke previous one conditionally/atomically
      const newRefreshTokenRaw = this.tokenService.generateSecureRandomToken();
      const newTokenHash = this.tokenService.hashToken(newRefreshTokenRaw);

      const IDLE_EXPIRES_MS = 7 * 24 * 60 * 60 * 1000;
      const proposedIdleExpiresAt = now + IDLE_EXPIRES_MS;
      // CRITICAL: Refreshing a token must never extend a session beyond its absolute maximum
      const maxAllowedExpiresAt = tokenRecord.session
        ? tokenRecord.session.expiresAt.getTime()
        : proposedIdleExpiresAt;
      const finalExpiresAt = new Date(Math.min(proposedIdleExpiresAt, maxAllowedExpiresAt));

      if (finalExpiresAt.getTime() <= now) {
        throw new UnauthorizedException('Session has reached its maximum absolute duration. Please log in again.');
      }

      // Atomic conditional rotation
      const rotationSuccess = await this.prisma.$transaction(async (tx) => {
        const updateResult = await tx.refreshToken.updateMany({
          where: {
            id: tokenRecord.id,
            isRevoked: false,
            replacedByTokenHash: null,
          },
          data: {
            isRevoked: true,
            replacedByTokenHash: newTokenHash,
          },
        });

        // If affected rows === 0, another concurrent request won the rotation race
        if (updateResult.count === 0) {
          return false;
        }

        // ONLY the winning request creates the new token
        await tx.refreshToken.create({
          data: {
            userId: user.id,
            sessionId: tokenRecord.sessionId,
            tokenHash: newTokenHash,
            family: tokenRecord.family,
            expiresAt: finalExpiresAt,
            userAgent: userAgent || tokenRecord.userAgent,
            ipAddress: ipAddress || tokenRecord.ipAddress,
          },
        });

        if (tokenRecord.sessionId) {
          await tx.session.updateMany({
            where: {
              id: tokenRecord.sessionId,
              isRevoked: false,
              expiresAt: { gt: new Date(now) },
            },
            data: { lastActivityAt: new Date(now) },
          });
        }

        return true;
      });

      if (rotationSuccess) {
        const accessToken = this.tokenService.generateAccessToken({
          sub: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          sid: tokenRecord.sessionId || undefined,
        });

        return {
          user: this.sanitizeUser(user),
          accessToken,
          refreshToken: newRefreshTokenRaw,
          sessionId: tokenRecord.sessionId || undefined,
        };
      }

      // If rotation failed due to concurrency race, retry loop will re-read state (strictly bounded to 2 attempts)
      this.logger.warn(`Refresh conflict on token ${tokenRecord.id}. Retrying bounded read (attempt ${attempt}/${MAX_ROTATION_ATTEMPTS})...`);
    }

    throw new UnauthorizedException('Refresh token rotation conflict. Please log in again.');
  }

  /**
   * Revokes refresh token, token family, and/or session on logout.
   */
  async logout(refreshTokenRaw?: string, sessionId?: string): Promise<void> {
    try {
      if (refreshTokenRaw) {
        const tokenHash = this.tokenService.hashToken(refreshTokenRaw);
        const record = await this.prisma.refreshToken.findUnique({
          where: { tokenHash },
        });
        if (record) {
          await this.prisma.refreshToken.updateMany({
            where: { family: record.family },
            data: { isRevoked: true },
          });
          if (record.sessionId) {
            await this.prisma.session.updateMany({
              where: { id: record.sessionId, isRevoked: false },
              data: { isRevoked: true, revokedAt: new Date() },
            });
          }
        }
      }

      if (sessionId) {
        await this.prisma.$transaction([
          this.prisma.session.updateMany({
            where: { id: sessionId, isRevoked: false },
            data: { isRevoked: true, revokedAt: new Date() },
          }),
          this.prisma.refreshToken.updateMany({
            where: { sessionId, isRevoked: false },
            data: { isRevoked: true },
          }),
        ]);
      }
    } catch (err) {
      this.logger.warn(`Logout cleanup encountered an issue: ${(err as Error).message}`);
    }
  }

  /**
   * Retrieves all active sessions for a user, indicating the current session.
   */
  async getSessions(userId: string, currentSessionId?: string) {
    const sessions = await this.prisma.session.findMany({
      where: {
        userId,
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { lastActivityAt: 'desc' },
      select: {
        id: true,
        userAgent: true,
        ipAddress: true,
        createdAt: true,
        lastActivityAt: true,
        expiresAt: true,
      },
    });

    return sessions.map((s) => ({
      ...s,
      isCurrent: s.id === currentSessionId,
    }));
  }

  /**
   * Revokes a specific session belonging to the user.
   */
  async revokeSession(userId: string, sessionId: string): Promise<{ message: string }> {
    const session = await this.prisma.session.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new BadRequestException('Session not found or does not belong to you');
    }

    await this.prisma.$transaction([
      this.prisma.session.update({
        where: { id: sessionId },
        data: { isRevoked: true, revokedAt: new Date() },
      }),
      this.prisma.refreshToken.updateMany({
        where: { sessionId },
        data: { isRevoked: true },
      }),
    ]);

    return { message: 'Session successfully revoked' };
  }

  /**
   * Terminates all active sessions for the user across all devices.
   */
  async logoutAll(userId: string): Promise<{ message: string }> {
    await this.prisma.$transaction([
      this.prisma.session.updateMany({
        where: { userId, isRevoked: false },
        data: { isRevoked: true, revokedAt: new Date() },
      }),
      this.prisma.refreshToken.updateMany({
        where: { userId, isRevoked: false },
        data: { isRevoked: true },
      }),
    ]);

    return { message: 'All active sessions have been terminated' };
  }

  /**
   * Initiates forgot-password flow. Returns generic message regardless of account presence.
   */
  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string; devResetToken?: string }> {
    const email = dto.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    const genericResponse = {
      message: 'If an account with that email exists, password reset instructions have been sent.',
    };

    if (!user || !user.isActive) {
      return genericResponse;
    }

    // Invalidate prior unused reset tokens
    await this.prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    // Generate secure 64-character token
    const rawResetToken = this.tokenService.generateSecureRandomToken();
    const tokenHash = this.tokenService.hashToken(rawResetToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour validity

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    this.logger.log(`Password reset requested for user ${user.id}`);

    // In development mode only, provide token in response for testing/DX
    if (process.env['NODE_ENV'] !== 'production') {
      return {
        ...genericResponse,
        devResetToken: rawResetToken,
      };
    }

    return genericResponse;
  }

  /**
   * Resets password using single-use cryptographic token and revokes active sessions.
   * Concurrency-safe: conditional database update ensures token cannot be double-consumed.
   */
  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const tokenHash = this.tokenService.hashToken(dto.token);

    const tokenRecord = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (!tokenRecord || tokenRecord.isUsed) {
      throw new BadRequestException('Invalid or expired password reset token');
    }

    if (tokenRecord.expiresAt < new Date()) {
      throw new BadRequestException('Password reset token has expired');
    }

    const newPasswordHash = await this.passwordService.hash(dto.newPassword);

    await this.prisma.$transaction(async (tx) => {
      // Concurrency defense: Atomically consume token. If another request consumed it, count is 0.
      const updateResult = await tx.passwordResetToken.updateMany({
        where: {
          id: tokenRecord.id,
          isUsed: false,
          expiresAt: { gt: new Date() },
        },
        data: {
          isUsed: true,
        },
      });

      if (updateResult.count === 0) {
        throw new BadRequestException('Password reset token has already been used or expired');
      }

      // Update password
      await tx.user.update({
        where: { id: tokenRecord.userId },
        data: { passwordHash: newPasswordHash },
      });

      // Revoke all active refresh tokens and sessions for this user
      await tx.refreshToken.updateMany({
        where: { userId: tokenRecord.userId, isRevoked: false },
        data: { isRevoked: true },
      });

      await tx.session.updateMany({
        where: { userId: tokenRecord.userId, isRevoked: false },
        data: { isRevoked: true, revokedAt: new Date() },
      });
    });

    return {
      message: 'Password has been reset successfully. Please log in with your new password.',
    };
  }

  /**
   * Returns current authenticated user and profile.
   */
  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        organizationMembers: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.sanitizeUser(user);
  }

  /**
   * Internal helper to generate access and refresh token pair.
   */
  private async createTokenPair(
    userId: string,
    email: string,
    username: string | null,
    role: Role,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<{ accessToken: string; refreshToken: string; sessionId: string }> {
    const now = Date.now();
    const ABSOLUTE_MAX_MS = 30 * 24 * 60 * 60 * 1000; // 30 days absolute session ceiling
    const IDLE_EXPIRES_MS = 7 * 24 * 60 * 60 * 1000;  // 7 days idle validity window

    const sessionAbsoluteExpiresAt = new Date(now + ABSOLUTE_MAX_MS);
    const refreshTokenExpiresAt = new Date(now + IDLE_EXPIRES_MS);

    // Create persistent session record with 30-day absolute maximum
    const session = await this.prisma.session.create({
      data: {
        userId,
        userAgent: userAgent || null,
        ipAddress: ipAddress || null,
        lastActivityAt: new Date(now),
        expiresAt: sessionAbsoluteExpiresAt,
      },
    });

    const accessToken = this.tokenService.generateAccessToken({
      sub: userId,
      email,
      username,
      role,
      sid: session.id,
    });

    const refreshTokenRaw = this.tokenService.generateSecureRandomToken();
    const tokenHash = this.tokenService.hashToken(refreshTokenRaw);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        sessionId: session.id,
        family: session.id,
        tokenHash,
        expiresAt: refreshTokenExpiresAt,
        userAgent: userAgent || null,
        ipAddress: ipAddress || null,
      },
    });

    return { accessToken, refreshToken: refreshTokenRaw, sessionId: session.id };
  }

  /**
   * Strips password hash and internal security fields before returning user object.
   */
  private sanitizeUser<
    T extends {
      id: string;
      email: string;
      username: string | null;
      name: string | null;
      role: Role;
      isActive: boolean;
      isEmailVerified: boolean;
      createdAt: Date;
      profile?: unknown;
      organizationMembers?: unknown;
    },
  >(user: T) {
    const { id, email, username, name, role, isActive, isEmailVerified, createdAt } = user;
    return {
      id,
      email,
      username,
      name,
      role,
      isActive,
      isEmailVerified,
      createdAt,
      profile: (user.profile as AuthResult['user']['profile']) || null,
      ...(user.organizationMembers ? { organizationMembers: user.organizationMembers } : {}),
    };
  }
}
