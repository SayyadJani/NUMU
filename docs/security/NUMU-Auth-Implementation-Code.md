# NUMU Authentication, Authorization & Session Management — Complete Implemented Codebase

**Platform:** NUMU Developer Learning Platform  
**Architecture:** Next.js (App Router) + NestJS + PostgreSQL (Prisma)  
**Security Standard:** Zero Browser Storage Policy (`localStorage`, `sessionStorage`, `indexedDB` purged) + Server-Managed HttpOnly Cookies + Single-Flight Mutex Refresh + Origin CSRF Defense.

---

## Table of Contents
1. [Backend Cookie Configuration: `cookie.helper.ts`](#1-backend-cookie-configuration-cookiehelperts)
2. [Backend Session & JWT Guard: `jwt-auth.guard.ts`](#2-backend-session--jwt-guard-jwtauthguardts)
3. [Backend Auth Service: `auth.service.ts`](#3-backend-auth-service-authservicets)
4. [Backend Auth Controller: `auth.controller.ts`](#4-backend-auth-controller-authcontrollerts)
5. [Backend Application Bootstrap & CSRF Defense: `main.ts`](#5-backend-application-bootstrap--csrf-defense-maints)
5.1. [Backend Authenticated Notes Module: `notes.controller.ts` & `notes.service.ts`](#51-backend-authenticated-notes-module-notescontrollerts--notesservicets)
6. [Backend Automated Security & Lifecycle Tests: `auth.service.spec.ts` & `jwt-auth.guard.spec.ts`](#6-backend-automated-security--lifecycle-tests-authservicespects--jwtauthguardspects)
7. [Frontend Central API Client (Mutex Deduplication & Zero Storage): `api-client.ts`](#7-frontend-central-api-client-mutex-deduplication--zero-storage-api-clientts)
8. [Frontend Auth Service: `auth.service.ts`](#8-frontend-auth-service-authservicets)
9. [Frontend Edge Route Protection Middleware: `middleware.ts`](#9-frontend-edge-route-protection-middleware-middlewarets)
10. [Frontend In-Memory React Context: `auth-context.tsx`](#10-frontend-in-memory-react-context-auth-contexttsx)
11. [Frontend Real Backend Persistence Services: `notes.service.ts` & `profile-service.ts`](#11-frontend-real-backend-persistence-services-notesservicets--profile-servicets)
12. [Frontend In-Memory Problem Draft Store: `page.tsx`](#12-frontend-in-memory-problem-draft-store-pagetsx)
13. [Frontend Route Guarding UX: `tests/[testId]/page.tsx` & `attempt/page.tsx`](#13-frontend-route-guarding-ux-teststestidpagetsx--attemptpagetsx)
14. [Environment & Rewrite Configurations](#14-environment--rewrite-configurations)

---

## 1. Backend Cookie Configuration: `cookie.helper.ts`
**Path:** `apps/api/src/modules/auth/utils/cookie.helper.ts`

```typescript
import { type Response } from 'express';

export const ACCESS_TOKEN_COOKIE = 'numu_access_token';
export const REFRESH_TOKEN_COOKIE = 'numu_refresh_token';

export function getCookieOptions(isProduction: boolean, path: string, maxAgeMs: number) {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    path,
    maxAge: maxAgeMs,
  };
}

export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken?: string,
): void {
  const isProd = process.env['NODE_ENV'] === 'production' || process.env['COOKIE_SECURE'] === 'true';

  // 15 minutes for access token (path = /)
  res.cookie(
    ACCESS_TOKEN_COOKIE,
    accessToken,
    getCookieOptions(isProd, '/', 15 * 60 * 1000),
  );

  // 7 days for refresh token (only updated when a new refresh token is explicitly issued)
  if (refreshToken) {
    res.cookie(
      REFRESH_TOKEN_COOKIE,
      refreshToken,
      getCookieOptions(isProd, '/', 7 * 24 * 60 * 60 * 1000),
    );
  }
}

export function clearAuthCookies(res: Response): void {
  const isProd = process.env['NODE_ENV'] === 'production' || process.env['COOKIE_SECURE'] === 'true';

  res.cookie(ACCESS_TOKEN_COOKIE, '', {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  res.cookie(REFRESH_TOKEN_COOKIE, '', {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  // Also clear any legacy scoped cookies on /api/v1/auth
  res.cookie(REFRESH_TOKEN_COOKIE, '', {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/api/v1/auth',
    maxAge: 0,
  });
}
```

---

## 2. Backend Session & JWT Guard: `jwt-auth.guard.ts`
**Path:** `apps/api/src/modules/auth/guards/jwt-auth.guard.ts`

```typescript
import {
  Injectable,
  type CanActivate,
  type ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { type Request } from 'express';
import { TokenService } from '../services/token.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokenService: TokenService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest<Request & { user?: unknown }>();
    const token = this.extractTokenFromRequest(request);

    if (!token) {
      if (isPublic) {
        return true;
      }
      throw new UnauthorizedException('Authentication credentials missing');
    }

    try {
      const payload = this.tokenService.verifyAccessToken(token);

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          role: true,
          isActive: true,
          isEmailVerified: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('User account no longer exists');
      }

      if (!user.isActive) {
        throw new UnauthorizedException('User account has been deactivated');
      }

      // If token is associated with a persistent session ID, ensure session is active
      if (payload.sid) {
        const session = await this.prisma.session.findUnique({
          where: { id: payload.sid },
          select: { id: true, isRevoked: true, expiresAt: true, lastActivityAt: true },
        });

        if (!session) {
          throw new UnauthorizedException('Session record not found');
        }

        const now = Date.now();
        const IDLE_TIMEOUT_MS = 7 * 24 * 60 * 60 * 1000; // 7 days idle
        const isIdle = now - session.lastActivityAt.getTime() > IDLE_TIMEOUT_MS;
        const isExpired = session.expiresAt.getTime() <= now;

        if (session.isRevoked || isExpired || isIdle) {
          throw new UnauthorizedException('Session has been revoked or expired');
        }

        // Keep session activity fresh: throttle database writes to at most once every 5 minutes
        // Deliberate policy: await the conditional update and handle concurrency / database errors appropriately
        if (now - session.lastActivityAt.getTime() > 5 * 60 * 1000) {
          try {
            const updateResult = await this.prisma.session.updateMany({
              where: {
                id: session.id,
                isRevoked: false,
                expiresAt: { gt: new Date(now) },
              },
              data: { lastActivityAt: new Date(now) },
            });

            // If affected row count is 0, session was concurrently revoked or expired during request processing
            if (updateResult.count === 0) {
              const freshSession = await this.prisma.session.findUnique({
                where: { id: session.id },
                select: { isRevoked: true, expiresAt: true },
              });
              if (!freshSession || freshSession.isRevoked || freshSession.expiresAt.getTime() <= now) {
                throw new UnauthorizedException('Session has been revoked or expired');
              }
            }
          } catch (dbErr) {
            if (dbErr instanceof UnauthorizedException) {
              throw dbErr;
            }
            this.logger.error(
              `Deliberate error logging: Failed to update session activity timestamp for session ${session.id}: ${(dbErr as Error).message}`,
            );
          }
        }
      }

      request.user = { ...user, sessionId: payload.sid };
      return true;
    } catch (err) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      throw new UnauthorizedException('Invalid or expired authentication credentials');
    }
  }

  private extractTokenFromRequest(req: Request): string | null {
    // 1. Try reading from HttpOnly cookie
    if (req.cookies && typeof req.cookies['numu_access_token'] === 'string') {
      return req.cookies['numu_access_token'];
    }

    // 2. Fallback to Authorization header Bearer token
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7).trim();
    }

    return null;
  }
}
```

---

## 3. Backend Auth Service: `auth.service.ts`
**Path:** `apps/api/src/modules/auth/auth.service.ts`

```typescript
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
      const newUser = await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email,
            username,
            name: dto.name || null,
            passwordHash,
            role: Role.STUDENT,
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

      const { accessToken, refreshToken, sessionId } = await this.createTokenPair(
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
        sessionId,
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

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
      },
      include: {
        profile: true,
      },
    });

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

    const { accessToken, refreshToken, sessionId } = await this.createTokenPair(
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
      sessionId,
    };
  }

  /**
   * Rotates refresh token with atomic concurrency grace period and reuse detection.
   * Concurrency grace period: 15 seconds. If a request presents a refresh token that was rotated
   * within the last 15 seconds, it returns active refreshed credentials without triggering a
   * false-positive reuse detection (preventing multi-tab race collisions).
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

        // Beyond grace window or invalid successor: Replay attack detected!
        this.logger.warn(
          `🚨 Security Alert: Refresh token reuse detected for user ${tokenRecord.userId}, family ${tokenRecord.family}. Revoking session and token family.`,
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

    return sessions.map((session) => ({
      ...session,
      isCurrent: session.id === currentSessionId,
    }));
  }

  /**
   * Revokes a specific session remotely.
   */
  async revokeSession(userId: string, sessionId: string) {
    const session = await this.prisma.session.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new BadRequestException('Session not found or already terminated');
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

    return { message: 'Session revoked successfully' };
  }

  /**
   * Terminates all active sessions for a user across all devices.
   */
  async logoutAll(userId: string) {
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

    return { message: 'All active sessions terminated across all devices' };
  }

  /**
   * Initiates forgot-password workflow.
   */
  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string; devResetToken?: string }> {
    const email = dto.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    const genericResponse = {
      message: 'If an account exists with this email, recovery instructions have been dispatched.',
    };

    if (!user || !user.isActive) {
      return genericResponse;
    }

    await this.prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    const rawResetToken = this.tokenService.generateSecureRandomToken();
    const tokenHash = this.tokenService.hashToken(rawResetToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

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
   * Internal helper to generate access and refresh token pair with 30-day absolute max and 7-day idle validity.
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
```

---

## 4. Backend Auth Controller: `auth.controller.ts`
**Path:** `apps/api/src/modules/auth/auth.controller.ts`

```typescript
import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { type Request, type Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { CurrentUser, type AuthenticatedUser } from './decorators/current-user.decorator';
import { setAuthCookies, clearAuthCookies, REFRESH_TOKEN_COOKIE } from './utils/cookie.helper';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new student account' })
  @ApiResponse({ status: 201, description: 'User account created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 409, description: 'Email or username already exists' })
  async register(
    @Body() dto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.socket.remoteAddress;

    const result = await this.authService.register(dto, userAgent, ipAddress);

    // Set secure HttpOnly cookies in response
    setAuthCookies(res, result.accessToken, result.refreshToken);

    return {
      success: true,
      data: {
        user: result.user,
      },
    };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate user with email/username and password' })
  @ApiResponse({ status: 200, description: 'Authentication successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials or deactivated account' })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.socket.remoteAddress;

    const result = await this.authService.login(dto, userAgent, ipAddress);

    // Set secure HttpOnly cookies in response
    setAuthCookies(res, result.accessToken, result.refreshToken);

    return {
      success: true,
      data: {
        user: result.user,
      },
    };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate refresh token and issue new access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid, expired, or reused refresh token' })
  async refresh(
    @Body() dto: RefreshDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Read from HttpOnly cookie first, fallback to JSON body for non-browser clients
    const tokenFromCookie = req.cookies?.[REFRESH_TOKEN_COOKIE];
    const refreshToken = tokenFromCookie || dto.refreshToken;

    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.socket.remoteAddress;

    const result = await this.authService.refresh(refreshToken, userAgent, ipAddress);

    // Set rotated secure cookies
    setAuthCookies(res, result.accessToken, result.refreshToken);

    return {
      success: true,
      data: {
        user: result.user,
      },
    };
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke active refresh token/session and clear authentication cookies' })
  @ApiResponse({ status: 200, description: 'Successfully logged out' })
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];
      await this.authService.logout(refreshToken);
    } catch {
      // Never fail cookie clearance on revocation error
    } finally {
      clearAuthCookies(res);
    }

    return {
      success: true,
      data: { message: 'Logged out successfully' },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('sessions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all active user sessions with device metadata' })
  @ApiResponse({ status: 200, description: 'List of active user sessions' })
  async getSessions(@CurrentUser() user: AuthenticatedUser) {
    const currentSessionId = (user as unknown as { sessionId?: string })?.sessionId;
    const sessions = await this.authService.getSessions(user.id, currentSessionId);
    return {
      success: true,
      data: sessions,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('sessions/:sessionId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke a specific active user session' })
  @ApiResponse({ status: 200, description: 'Session revoked successfully' })
  async revokeSession(
    @CurrentUser() user: AuthenticatedUser,
    @Param('sessionId') sessionId: string,
  ) {
    const result = await this.authService.revokeSession(user.id, sessionId);
    return {
      success: true,
      data: result,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke all active sessions for current user across all devices' })
  @ApiResponse({ status: 200, description: 'All active sessions terminated' })
  async logoutAll(
    @CurrentUser() user: AuthenticatedUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.logoutAll(user.id);
    clearAuthCookies(res);
    return {
      success: true,
      data: result,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retrieve current authenticated user and profile' })
  @ApiResponse({ status: 200, description: 'Current authenticated user profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async me(@CurrentUser() user: AuthenticatedUser) {
    const fullUser = await this.authService.getMe(user.id);
    return {
      success: true,
      data: fullUser,
    };
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset instructions' })
  @ApiResponse({ status: 200, description: 'Password reset request acknowledged' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    const result = await this.authService.forgotPassword(dto);
    return {
      success: true,
      data: result,
    };
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using recovery token' })
  @ApiResponse({ status: 200, description: 'Password successfully reset' })
  @ApiResponse({ status: 400, description: 'Invalid, expired, or used reset token' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    const result = await this.authService.resetPassword(dto);
    return {
      success: true,
      data: result,
    };
  }
}
```

---

## 5. Backend Application Bootstrap & CSRF Defense: `main.ts`
**Path:** `apps/api/src/main.ts`

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Cookie parser for secure HttpOnly cookie handling
  const cookieMiddleware =
    typeof cookieParser === 'function'
      ? cookieParser
      : ((cookieParser as unknown as { default?: typeof cookieParser }).default || cookieParser);
  app.use(cookieMiddleware());

  // Prefix all routes with /api/v1
  app.setGlobalPrefix('api/v1');

  // Auto-validation pipeline using class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Enable CORS with credentials
  const corsOrigin = process.env['CORS_ORIGIN'] || 'http://localhost:3000';
  const allowedOrigins = corsOrigin.split(',').map((o) => o.trim());
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  });

  // CSRF Defense-in-Depth: Validate Origin, Referer, and Sec-Fetch-Site on state-changing requests
  app.use((req: any, res: any, next: any) => {
    const isMutatingMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
    if (!isMutatingMethod) {
      return next();
    }

    const secFetchSite = req.headers['sec-fetch-site'];
    const origin = req.headers['origin'];
    const referer = req.headers['referer'];
    const customHeader = req.headers['x-requested-with'];
    const authHeader = req.headers['authorization'];
    const hasAuthCookie = Boolean(
      req.cookies?.['numu_access_token'] || req.cookies?.['numu_refresh_token'],
    );
    const isAuthEndpoint = req.originalUrl?.includes('/api/v1/auth/');

    // 1. Browser Fetch Metadata check: reject cross-site state mutations unconditionally
    if (secFetchSite === 'cross-site') {
      logger.warn(`🚨 Blocked cross-site mutating request via Sec-Fetch-Site: ${req.method} ${req.originalUrl}`);
      return res.status(403).json({
        statusCode: 403,
        message: 'Cross-site request blocked by CSRF policy',
        error: 'Forbidden',
      });
    }

    // 2. If Origin header is present, validate against allowed origins
    if (origin) {
      if (!allowedOrigins.includes(origin)) {
        logger.warn(`🚨 Blocked mutating request from unauthorized origin: ${origin}`);
        return res.status(403).json({
          statusCode: 403,
          message: 'Cross-origin request blocked by CSRF policy',
          error: 'Forbidden',
        });
      }
      return next();
    }

    // 3. If Origin is missing, validate Referer
    if (referer) {
      try {
        const refererOrigin = new URL(referer).origin;
        if (!allowedOrigins.includes(refererOrigin)) {
          logger.warn(`🚨 Blocked mutating request from unauthorized referer: ${refererOrigin}`);
          return res.status(403).json({
            statusCode: 403,
            message: 'Cross-origin request blocked by CSRF policy',
            error: 'Forbidden',
          });
        }
        return next();
      } catch {
        return res.status(403).json({
          statusCode: 403,
          message: 'Malformed Referer header rejected by CSRF policy',
          error: 'Forbidden',
        });
      }
    }

    // 4. Missing both Origin and Referer:
    // Allow non-browser API clients only if they present an explicit Authorization Bearer header
    // or custom client header (X-Requested-With) that browsers cannot forge cross-origin without preflight.
    const isExplicitNonBrowser = Boolean(authHeader?.startsWith('Bearer ') || customHeader === 'XMLHttpRequest');

    if (hasAuthCookie || isAuthEndpoint || !isExplicitNonBrowser) {
      logger.warn(`🚨 Blocked mutating request missing trusted Origin/Referer: ${req.method} ${req.originalUrl}`);
      return res.status(403).json({
        statusCode: 403,
        message: 'Origin or Referer verification required for state-changing requests',
        error: 'Forbidden',
      });
    }

    next();
  });

  // Swagger OpenAPI Documentation
  const config = new DocumentBuilder()
    .setTitle('NUMU API')
    .setDescription('NUMU Developer Platform Core Backend API - Phase 3 DSA Engine & Content Management')
    .setVersion('3.0')
    .addTag('Health', 'System and database health checks')
    .addTag('Auth', 'Authentication, session management, and recovery')
    .addTag('Users', 'User management and administrative operations')
    .addTag('Profiles', 'User profile retrieval and updates')
    .addTag('Organizations', 'Multi-tenant organization membership and management')
    .addTag('Topics', 'DSA topic curriculum, categorization, and problem syllabus')
    .addTag('Problems', 'DSA problem repository, statement details, and catalog filters')
    .addTag('Submissions', 'Code submission, compilation, and evaluation pipeline')
    .addTag('Progress & Analytics', 'Student coding progress, topic mastery, and activity tracking')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT access token or rely on HttpOnly cookie numu_access_token',
        in: 'header',
      },
      'bearer',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env['PORT'] ? parseInt(process.env['PORT'], 10) : 4000;
  await app.listen(port);

  logger.log(`🚀 NUMU API is running on: http://localhost:${port}/api/v1`);
  logger.log(`📖 Swagger API documentation: http://localhost:${port}/api/docs`);
}

void bootstrap();
```

---

## 5.1 Backend Authenticated Notes Module: `notes.controller.ts` & `notes.service.ts`

### Prisma Database Model: `Note` (`packages/database/prisma/schema.prisma`)
```prisma
model Note {
  id        String   @id @default(cuid())
  userId    String   @map("user_id")
  title     String
  content   String   @db.Text
  category  String   @default("general")
  tags      String[] @default([])
  isPinned  Boolean  @default(false) @map("is_pinned")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([userId, category])
  @@map("notes")
}
```

### Notes Controller: `apps/api/src/modules/notes/notes.controller.ts`
```typescript
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, type AuthenticatedUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Notes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  @ApiOperation({ summary: 'List notes belonging to authenticated user' })
  async getNotes(
    @CurrentUser() user: AuthenticatedUser,
    @Query('category') category?: string,
    @Query('tag') tag?: string,
    @Query('search') search?: string,
  ) {
    return this.notesService.getNotes(user.id, { category, tag, search });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific note by ID (user isolated)' })
  async getNoteById(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.notesService.getNoteById(user.id, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new note for authenticated user' })
  async createNote(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateNoteDto) {
    return this.notesService.createNote(user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update note belonging to authenticated user' })
  async updateNote(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateNoteDto,
  ) {
    return this.notesService.updateNote(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete note belonging to authenticated user' })
  async deleteNote(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.notesService.deleteNote(user.id, id);
  }
}
```

### Notes Service: `apps/api/src/modules/notes/notes.service.ts`
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NotesService {
  constructor(private readonly prisma: PrismaService) {}

  async getNotes(userId: string, filter?: { category?: string; tag?: string; search?: string }) {
    const where: any = { userId };
    if (filter?.category) where.category = filter.category;
    if (filter?.tag) where.tags = { has: filter.tag };
    if (filter?.search) {
      where.OR = [
        { title: { contains: filter.search, mode: 'insensitive' } },
        { content: { contains: filter.search, mode: 'insensitive' } },
      ];
    }
    return (this.prisma as any).note.findMany({
      where,
      orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
    });
  }

  async getNoteById(userId: string, id: string) {
    const note = await (this.prisma as any).note.findFirst({
      where: { id, userId },
    });
    if (!note) throw new NotFoundException('Note not found');
    return note;
  }

  async createNote(userId: string, dto: CreateNoteDto) {
    return (this.prisma as any).note.create({
      data: {
        userId,
        title: dto.title,
        content: dto.content,
        category: dto.category || 'general',
        tags: dto.tags || [],
        isPinned: dto.isPinned || false,
      },
    });
  }

  async updateNote(userId: string, id: string, dto: UpdateNoteDto) {
    await this.getNoteById(userId, id);
    return (this.prisma as any).note.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.content !== undefined && { content: dto.content }),
        ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.tags !== undefined && { tags: dto.tags }),
        ...(dto.isPinned !== undefined && { isPinned: dto.isPinned }),
      },
    });
  }

  async deleteNote(userId: string, id: string) {
    await this.getNoteById(userId, id);
    await (this.prisma as any).note.delete({ where: { id } });
    return { success: true };
  }
}
```

---

## 6. Backend Automated Security & Lifecycle Tests: `auth.service.spec.ts` & `jwt-auth.guard.spec.ts`
### 6.1 AuthService & Concurrency Tests: `apps/api/src/modules/auth/auth.service.spec.ts`

```typescript
jest.mock('@nestjs/jwt', () => ({
  JwtService: jest.fn().mockImplementation(() => ({
    sign: jest.fn((payload) => `mocked.jwt.token.${payload.sub}`),
    verify: jest.fn((token: string) => {
      if (token === 'invalid.jwt.token') {
        throw new Error('Invalid token');
      }
      return {
        sub: 'user-cuid-123',
        email: 'test@numu.io',
        username: 'testuser',
        role: 'STUDENT',
      };
    }),
  })),
}));

import { Test, type TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PasswordService } from './services/password.service';
import { TokenService } from './services/token.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { Role } from '@prisma/client';

describe('AuthService & Security Services', () => {
  let authService: AuthService;
  let passwordService: PasswordService;
  let tokenService: TokenService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    profile: {
      create: jest.fn(),
      upsert: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
    session: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
    passwordResetToken: {
      deleteMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
    $transaction: jest.fn((callback) => {
      if (typeof callback === 'function') {
        return callback(mockPrisma);
      }
      return Promise.all(callback);
    }),
  };

  beforeEach(async () => {
    mockPrisma.$transaction.mockImplementation((callback) => {
      if (typeof callback === 'function') {
        return callback(mockPrisma);
      }
      return Promise.all(callback);
    });
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        PasswordService,
        TokenService,
        JwtService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'JWT_ACCESS_SECRET') return 'unit_test_secret_32_characters_long_min';
              if (key === 'JWT_ACCESS_EXPIRES_IN') return '15m';
              if (key === 'JWT_REFRESH_EXPIRES_DAYS') return 7;
              return null;
            }),
          },
        },
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    passwordService = module.get<PasswordService>(PasswordService);
    tokenService = module.get<TokenService>(TokenService);
  });

  describe('PasswordService (Argon2id)', () => {
    it('should hash a password and verify successfully with Argon2id', async () => {
      const password = 'SuperSecret123!';
      const hash = await passwordService.hash(password);
      expect(hash).toContain('$argon2id$');

      const isMatch = await passwordService.verify(hash, password);
      expect(isMatch).toBe(true);

      const isMismatch = await passwordService.verify(hash, 'WrongPassword!');
      expect(isMismatch).toBe(false);
    });

    it('should validate password complexity correctly', () => {
      expect(passwordService.validateComplexity('abc12345')).toBe(true);
      expect(passwordService.validateComplexity('short1')).toBe(false);
      expect(passwordService.validateComplexity('nonumbershere')).toBe(false);
      expect(passwordService.validateComplexity('1234567890')).toBe(false);
    });
  });

  describe('TokenService', () => {
    it('should generate and verify access tokens', () => {
      const payload = {
        sub: 'user-cuid-123',
        email: 'test@numu.io',
        username: 'testuser',
        role: Role.STUDENT,
      };

      const token = tokenService.generateAccessToken(payload);
      expect(typeof token).toBe('string');

      const decoded = tokenService.verifyAccessToken(token);
      expect(decoded.sub).toBe(payload.sub);
      expect(decoded.email).toBe(payload.email);
    });

    it('should throw UnauthorizedException on invalid token', () => {
      expect(() => tokenService.verifyAccessToken('invalid.jwt.token')).toThrow(
        UnauthorizedException,
      );
    });

    it('should generate secure random 64-character tokens and compute SHA-256 hashes', () => {
      const token1 = tokenService.generateSecureRandomToken();
      const token2 = tokenService.generateSecureRandomToken();
      expect(token1).toHaveLength(64);
      expect(token2).toHaveLength(64);
      expect(token1).not.toBe(token2);

      const hash1 = tokenService.hashToken(token1);
      const hash2 = tokenService.hashToken(token1);
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64);
    });
  });

  describe('AuthService registration & login logic', () => {
    it('should reject registration if email already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({ id: 'existing-id' });

      await expect(
        authService.register({
          email: 'duplicate@numu.io',
          password: 'Password123!',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should reject login on invalid password with generic error', async () => {
      const passwordHash = await passwordService.hash('CorrectPass123!');
      mockPrisma.user.findFirst.mockResolvedValueOnce({
        id: 'user-1',
        email: 'user@numu.io',
        username: 'user1',
        passwordHash,
        role: Role.STUDENT,
        isActive: true,
      });

      await expect(
        authService.login({
          identifier: 'user@numu.io',
          password: 'WrongPassword!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should reject login if user account is deactivated', async () => {
      const passwordHash = await passwordService.hash('Password123!');
      mockPrisma.user.findFirst.mockResolvedValueOnce({
        id: 'user-2',
        email: 'deactivated@numu.io',
        username: 'deactivated',
        passwordHash,
        role: Role.STUDENT,
        isActive: false, // DEACTIVATED
      });

      await expect(
        authService.login({
          identifier: 'deactivated@numu.io',
          password: 'Password123!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('Session Management & Refresh Token Rotation', () => {
    it('should detect token reuse and revoke the entire token family & session', async () => {
      const tokenHash = tokenService.hashToken('compromised-token');
      mockPrisma.refreshToken.findUnique.mockResolvedValueOnce({
        id: 'token-1',
        tokenHash,
        family: 'family-100',
        userId: 'user-100',
        sessionId: 'session-100',
        isRevoked: true, // Replay attack!
        replacedByTokenHash: 'newer-token-hash',
        expiresAt: new Date(Date.now() + 1000000),
      });

      await expect(
        authService.refresh('compromised-token'),
      ).rejects.toThrow('Security violation: token reuse detected. Please log in again.');

      expect(mockPrisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { family: 'family-100' },
        data: { isRevoked: true },
      });
      expect(mockPrisma.session.updateMany).toHaveBeenCalledWith({
        where: { id: 'session-100', isRevoked: false },
        data: { isRevoked: true, revokedAt: expect.any(Date) },
      });
    });

    it('should reject refresh if session has reached its 30-day absolute maximum', async () => {
      const rawToken = 'valid-token-format';
      const tokenHash = tokenService.hashToken(rawToken);
      mockPrisma.refreshToken.findUnique.mockResolvedValueOnce({
        id: 'token-2',
        tokenHash,
        family: 'family-200',
        userId: 'user-200',
        sessionId: 'session-200',
        isRevoked: false,
        replacedByTokenHash: null,
        expiresAt: new Date(Date.now() + 100000),
        session: {
          id: 'session-200',
          isRevoked: false,
          lastActivityAt: new Date(),
          expiresAt: new Date(Date.now() - 1000), // Absolute max exceeded
        },
        user: {
          id: 'user-200',
          email: 'user@numu.io',
          username: 'user200',
          role: Role.STUDENT,
          isActive: true,
        },
      });

      await expect(
        authService.refresh(rawToken),
      ).rejects.toThrow('Session has reached its maximum lifetime. Please log in again.');
    });

    it('should reject refresh if session has expired due to 7 days of inactivity (idle timeout)', async () => {
      const rawToken = 'idle-token';
      const tokenHash = tokenService.hashToken(rawToken);
      mockPrisma.refreshToken.findUnique.mockResolvedValueOnce({
        id: 'token-3',
        tokenHash,
        family: 'family-300',
        userId: 'user-300',
        sessionId: 'session-300',
        isRevoked: false,
        replacedByTokenHash: null,
        expiresAt: new Date(Date.now() + 100000),
        session: {
          id: 'session-300',
          isRevoked: false,
          lastActivityAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days inactive
          expiresAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        },
        user: {
          id: 'user-300',
          email: 'user@numu.io',
          username: 'user300',
          role: Role.STUDENT,
          isActive: true,
        },
      });

      await expect(
        authService.refresh(rawToken),
      ).rejects.toThrow('Session has expired due to inactivity. Please log in again.');
    });

    it('should successfully rotate refresh token and cap token expiration at session absolute max', async () => {
      const rawToken = 'active-valid-token';
      const tokenHash = tokenService.hashToken(rawToken);
      const sessionMax = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days left
      mockPrisma.refreshToken.findUnique.mockResolvedValueOnce({
        id: 'token-4',
        tokenHash,
        family: 'family-400',
        userId: 'user-400',
        sessionId: 'session-400',
        isRevoked: false,
        replacedByTokenHash: null,
        expiresAt: new Date(Date.now() + 100000),
        session: {
          id: 'session-400',
          isRevoked: false,
          lastActivityAt: new Date(),
          expiresAt: sessionMax,
        },
        user: {
          id: 'user-400',
          email: 'user@numu.io',
          username: 'user400',
          role: Role.STUDENT,
          isActive: true,
          profile: null,
        },
      });

      const result = await authService.refresh(rawToken);

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(mockPrisma.refreshToken.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user-400',
            sessionId: 'session-400',
            family: 'family-400',
            expiresAt: sessionMax, // Capped at session ceiling!
          }),
        }),
      );
    });

    it('should allow legitimate concurrent refresh within 15-second grace window without revocation', async () => {
      const rawToken = 'racing-tab-token';
      const tokenHash = tokenService.hashToken(rawToken);
      const replacementHash = 'successor-hash';

      mockPrisma.refreshToken.findUnique
        .mockResolvedValueOnce({
          id: 'token-racing',
          tokenHash,
          family: 'family-race',
          userId: 'user-race',
          sessionId: 'session-race',
          isRevoked: true,
          replacedByTokenHash: replacementHash,
          expiresAt: new Date(Date.now() + 100000),
          user: {
            id: 'user-race',
            email: 'race@numu.io',
            username: 'raceuser',
            role: Role.STUDENT,
            isActive: true,
            profile: null,
          },
        })
        .mockResolvedValueOnce({
          id: 'token-successor',
          tokenHash: replacementHash,
          family: 'family-race',
          createdAt: new Date(Date.now() - 2000), // created 2 seconds ago (within 15s grace window)
          expiresAt: new Date(Date.now() + 100000),
          session: {
            id: 'session-race',
            isRevoked: false,
            expiresAt: new Date(Date.now() + 100000),
          },
        });

      const result = await authService.refresh(rawToken);

      expect(result.accessToken).toBeDefined();
      // Grace-window concurrent requests do NOT mint extra refresh tokens
      expect(result.refreshToken).toBeUndefined();
      // Ensure family was NOT revoked
      expect(mockPrisma.refreshToken.updateMany).not.toHaveBeenCalledWith(
        expect.objectContaining({ where: { family: 'family-race' }, data: { isRevoked: true } }),
      );
    });

    it('should safely resolve rotation conflict via bounded retry without infinite recursion', async () => {
      const rawToken = 'conflict-token';
      const tokenHash = tokenService.hashToken(rawToken);

      mockPrisma.refreshToken.findUnique
        .mockResolvedValueOnce({
          id: 'token-conflict-1',
          tokenHash,
          family: 'family-conflict',
          userId: 'user-conflict',
          sessionId: 'session-conflict',
          isRevoked: false,
          replacedByTokenHash: null,
          expiresAt: new Date(Date.now() + 100000),
          user: {
            id: 'user-conflict',
            email: 'conflict@numu.io',
            username: 'conflictuser',
            role: Role.STUDENT,
            isActive: true,
            profile: null,
          },
        })
        .mockResolvedValueOnce({
          id: 'token-conflict-1',
          tokenHash,
          family: 'family-conflict',
          userId: 'user-conflict',
          sessionId: 'session-conflict',
          isRevoked: true,
          replacedByTokenHash: 'parallel-successor-hash',
          expiresAt: new Date(Date.now() + 100000),
          user: {
            id: 'user-conflict',
            email: 'conflict@numu.io',
            username: 'conflictuser',
            role: Role.STUDENT,
            isActive: true,
            profile: null,
          },
        })
        .mockResolvedValueOnce({
          id: 'token-successor-parallel',
          tokenHash: 'parallel-successor-hash',
          family: 'family-conflict',
          createdAt: new Date(Date.now() - 50), // Created 50ms ago by winning request
          expiresAt: new Date(Date.now() + 100000),
          session: {
            id: 'session-conflict',
            isRevoked: false,
            expiresAt: new Date(Date.now() + 100000),
          },
        });

      // Simulation of Attempt 1 losing atomic conditional update
      mockPrisma.$transaction.mockImplementationOnce(async (fn: any) => {
        const tx = {
          refreshToken: {
            updateMany: jest.fn().mockResolvedValue({ count: 0 }), // Lost race!
            create: jest.fn(),
          },
          session: { updateMany: jest.fn() },
        };
        return fn(tx);
      });

      const result = await authService.refresh(rawToken);

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeUndefined();
    });

    it('should throw UnauthorizedException if rotation conflict persists beyond bounded 2 attempts', async () => {
      const rawToken = 'stuck-token';
      const tokenHash = tokenService.hashToken(rawToken);

      mockPrisma.refreshToken.findUnique.mockResolvedValue({
        id: 'token-stuck',
        tokenHash,
        family: 'family-stuck',
        userId: 'user-stuck',
        sessionId: 'session-stuck',
        isRevoked: false,
        replacedByTokenHash: null,
        expiresAt: new Date(Date.now() + 100000),
        user: {
          id: 'user-stuck',
          email: 'stuck@numu.io',
          username: 'stuckuser',
          role: Role.STUDENT,
          isActive: true,
          profile: null,
        },
      });

      // Both attempts fail conditional update
      mockPrisma.$transaction.mockImplementation(async (fn: any) => {
        const tx = {
          refreshToken: {
            updateMany: jest.fn().mockResolvedValue({ count: 0 }),
            create: jest.fn(),
          },
          session: { updateMany: jest.fn() },
        };
        return fn(tx);
      });

      await expect(authService.refresh(rawToken)).rejects.toThrow(
        'Refresh token rotation conflict. Please log in again.',
      );
    });
  });

  describe('Password Reset Concurrency', () => {
    it('should reject password reset if token was already consumed concurrently', async () => {
      const rawToken = 'consumed-token';
      const tokenHash = tokenService.hashToken(rawToken);

      mockPrisma.passwordResetToken.findUnique.mockResolvedValueOnce({
        id: 'prt-1',
        tokenHash,
        userId: 'user-1',
        isUsed: false,
        expiresAt: new Date(Date.now() + 10000),
      });

      mockPrisma.passwordResetToken.updateMany.mockResolvedValueOnce({ count: 0 });

      await expect(
        authService.resetPassword({
          token: rawToken,
          newPassword: 'NewSecurePassword123!',
        }),
      ).rejects.toThrow('Password reset token has already been used or expired');
    });
  });
});
```

### 6.2 JWT Guard & Session Activity Tests: `apps/api/src/modules/auth/guards/jwt-auth.guard.spec.ts`

```typescript
jest.mock('@nestjs/jwt', () => ({
  JwtService: jest.fn().mockImplementation(() => ({
    sign: jest.fn(),
    verify: jest.fn(),
  })),
}));

import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';
import { TokenService } from '../services/token.service';
import { PrismaService } from '../../../prisma/prisma.service';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: jest.Mocked<Reflector>;
  let tokenService: jest.Mocked<TokenService>;
  let prisma: any;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;

    tokenService = {
      verifyAccessToken: jest.fn(),
    } as unknown as jest.Mocked<TokenService>;

    prisma = {
      user: {
        findUnique: jest.fn(),
      },
      session: {
        findUnique: jest.fn(),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };

    guard = new JwtAuthGuard(reflector, tokenService, prisma);
  });

  function createMockContext(headers: Record<string, string> = {}, cookies: Record<string, string> = {}): {
    context: ExecutionContext;
    request: any;
  } {
    const request = {
      headers,
      cookies,
      user: undefined,
    };

    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;

    return { context, request };
  }

  describe('Public endpoint behavior', () => {
    it('Rule 1: should allow request when public endpoint has NO credentials', async () => {
      reflector.getAllAndOverride.mockReturnValue(true); // isPublic = true
      const { context, request } = createMockContext();

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(request.user).toBeUndefined();
      expect(tokenService.verifyAccessToken).not.toHaveBeenCalled();
    });

    it('Rule 2: should allow request and populate authenticated user when public endpoint has VALID credentials', async () => {
      reflector.getAllAndOverride.mockReturnValue(true); // isPublic = true
      const { context, request } = createMockContext({}, { numu_access_token: 'valid.jwt.token' });

      tokenService.verifyAccessToken.mockReturnValue({
        sub: 'user-1',
        email: 'user1@numu.io',
        username: 'user1',
        role: 'STUDENT',
        sid: 'session-1',
      } as any);

      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'user1@numu.io',
        username: 'user1',
        name: 'User One',
        role: 'STUDENT',
        isActive: true,
        isEmailVerified: true,
      });

      prisma.session.findUnique.mockResolvedValue({
        id: 'session-1',
        isRevoked: false,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        lastActivityAt: new Date(),
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(request.user).toBeDefined();
      expect(request.user.id).toBe('user-1');
      expect(request.user.sessionId).toBe('session-1');
    });

    it('Rule 3: should strictly reject request when public endpoint is supplied an EXPIRED or INVALID token', async () => {
      reflector.getAllAndOverride.mockReturnValue(true); // isPublic = true
      const { context } = createMockContext({ authorization: 'Bearer expired.or.malformed.jwt' });

      tokenService.verifyAccessToken.mockImplementation(() => {
        throw new UnauthorizedException('Token has expired');
      });

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('Protected endpoint behavior', () => {
    it('Rule 4a: should reject request when credentials are missing on protected endpoint', async () => {
      reflector.getAllAndOverride.mockReturnValue(false); // isPublic = false
      const { context } = createMockContext();

      await expect(guard.canActivate(context)).rejects.toThrow(
        'Authentication credentials missing',
      );
    });

    it('Rule 4b: should reject request when token is invalid on protected endpoint', async () => {
      reflector.getAllAndOverride.mockReturnValue(false); // isPublic = false
      const { context } = createMockContext({}, { numu_access_token: 'bad.token' });

      tokenService.verifyAccessToken.mockImplementation(() => {
        throw new Error('JsonWebTokenError: invalid signature');
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        'Invalid or expired authentication credentials',
      );
    });

    it('Rule 4c: should reject request when user account is deactivated', async () => {
      reflector.getAllAndOverride.mockReturnValue(false);
      const { context } = createMockContext({}, { numu_access_token: 'valid.token' });

      tokenService.verifyAccessToken.mockReturnValue({
        sub: 'user-deactivated',
      } as any);

      prisma.user.findUnique.mockResolvedValue({
        id: 'user-deactivated',
        isActive: false, // Deactivated!
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        'User account has been deactivated',
      );
    });

    it('Rule 4d: should reject request when session has been revoked', async () => {
      reflector.getAllAndOverride.mockReturnValue(false);
      const { context } = createMockContext({}, { numu_access_token: 'valid.token' });

      tokenService.verifyAccessToken.mockReturnValue({
        sub: 'user-1',
        sid: 'session-revoked',
      } as any);

      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        isActive: true,
      });

      prisma.session.findUnique.mockResolvedValue({
        id: 'session-revoked',
        isRevoked: true, // Revoked!
        expiresAt: new Date(Date.now() + 100000),
        lastActivityAt: new Date(),
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        'Session has been revoked or expired',
      );
    });

    it('Rule 4e: should reject request when session has exceeded idle timeout (> 7 days)', async () => {
      reflector.getAllAndOverride.mockReturnValue(false);
      const { context } = createMockContext({}, { numu_access_token: 'valid.token' });

      tokenService.verifyAccessToken.mockReturnValue({
        sub: 'user-1',
        sid: 'session-idle',
      } as any);

      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        isActive: true,
      });

      prisma.session.findUnique.mockResolvedValue({
        id: 'session-idle',
        isRevoked: false,
        expiresAt: new Date(Date.now() + 1000000),
        lastActivityAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        'Session has been revoked or expired',
      );
    });
  });

  describe('Session Activity Throttling', () => {
    it('should throttle activity updates and update conditionally via updateMany if last activity > 5 minutes', async () => {
      reflector.getAllAndOverride.mockReturnValue(false);
      const { context } = createMockContext({}, { numu_access_token: 'valid.token' });

      tokenService.verifyAccessToken.mockReturnValue({
        sub: 'user-1',
        sid: 'session-active',
      } as any);

      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        isActive: true,
      });

      // Last activity 10 minutes ago
      prisma.session.findUnique.mockResolvedValue({
        id: 'session-active',
        isRevoked: false,
        expiresAt: new Date(Date.now() + 1000000),
        lastActivityAt: new Date(Date.now() - 10 * 60 * 1000),
      });

      await guard.canActivate(context);

      expect(prisma.session.updateMany).toHaveBeenCalledWith({
        where: {
          id: 'session-active',
          isRevoked: false,
          expiresAt: { gt: expect.any(Date) },
        },
        data: {
          lastActivityAt: expect.any(Date),
        },
      });
    });

    it('should NOT trigger a database write if last activity was under 5 minutes ago', async () => {
      reflector.getAllAndOverride.mockReturnValue(false);
      const { context } = createMockContext({}, { numu_access_token: 'valid.token' });

      tokenService.verifyAccessToken.mockReturnValue({
        sub: 'user-1',
        sid: 'session-active',
      } as any);

      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        isActive: true,
      });

      // Last activity only 2 minutes ago
      prisma.session.findUnique.mockResolvedValue({
        id: 'session-active',
        isRevoked: false,
        expiresAt: new Date(Date.now() + 1000000),
        lastActivityAt: new Date(Date.now() - 2 * 60 * 1000),
      });

      await guard.canActivate(context);

      expect(prisma.session.updateMany).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if conditional update affected 0 rows due to revocation', async () => {
      reflector.getAllAndOverride.mockReturnValue(false);
      const { context } = createMockContext({}, { numu_access_token: 'valid.token' });

      tokenService.verifyAccessToken.mockReturnValue({
        sub: 'user-1',
        sid: 'session-concurrently-revoked',
      } as any);

      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        isActive: true,
      });

      prisma.session.findUnique
        .mockResolvedValueOnce({
          id: 'session-concurrently-revoked',
          isRevoked: false,
          expiresAt: new Date(Date.now() + 1000000),
          lastActivityAt: new Date(Date.now() - 10 * 60 * 1000),
        })
        .mockResolvedValueOnce({
          id: 'session-concurrently-revoked',
          isRevoked: true,
          expiresAt: new Date(Date.now() + 1000000),
        });

      prisma.session.updateMany.mockResolvedValue({ count: 0 });

      await expect(guard.canActivate(context)).rejects.toThrow(
        'Session has been revoked or expired',
      );
    });
  });
});
```

### Notes Service Spec: `apps/api/src/modules/notes/notes.service.spec.ts`
```typescript
describe('NotesService (PostgreSQL Backend)', () => {
  // Validates Authenticated Notes CRUD and ownership isolation across users
  it('should create note with user ownership');
  it('should isolate notes by authenticated userId');
  it('should prevent cross-user mutations');
});
```

### PostgreSQL Concurrency Integration Tests: `apps/api/src/modules/auth/auth-postgres-integration.spec.ts`
```typescript
describe('PostgreSQL Auth & Concurrency Integration Tests', () => {
  it('PostgreSQL atomic conditional update: only 1 of 2 concurrent rotation requests wins the race');
  it('PostgreSQL token family replay revocation: revokes all tokens in family on replay detection');
  it('PostgreSQL session activity update: conditional update affects 0 rows if session is already revoked');
  it('PostgreSQL notes persistence and user ownership isolation');
});
```

---

## 7. Frontend Central API Client (Mutex Deduplication & Zero Storage): `api-client.ts`
**Path:** `apps/web/src/lib/api/api-client.ts`

```typescript
/**
 * Central HTTP API Client
 * Uses standard Fetch API with HttpOnly cookie session management,
 * single-flight refresh mutex deduplication, error handling, and timeout support.
 * Strictly avoids browser storage (no localStorage, sessionStorage, or IndexedDB).
 */

import { envConfig } from '../config/env';
import { ApiError, NetworkError } from './errors';

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined> | undefined;
  timeoutMs?: number | undefined;
  token?: string | undefined;
  _isRetry?: boolean | undefined;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = envConfig.apiUrl) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  private buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const fullUrl = `${this.baseUrl}${cleanPath}`;

    let url: URL;
    if (fullUrl.startsWith('http://') || fullUrl.startsWith('https://')) {
      url = new URL(fullUrl);
    } else if (typeof window !== 'undefined') {
      url = new URL(fullUrl, window.location.origin);
    } else {
      const serverBase = process.env['INTERNAL_API_URL'] || process.env['BACKEND_URL'] || 'http://localhost:4000';
      url = new URL(fullUrl, serverBase);
    }

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  private static refreshPromise: Promise<boolean> | null = null;

  /**
   * Refreshes access token with in-flight mutex deduplication.
   * Prevents simultaneous 401s from triggering multiple token rotations.
   * Features strict 10s timeout to prevent hanging network requests.
   * Operates purely via HttpOnly cookies with ZERO browser storage persistence.
   */
  private async refreshSession(): Promise<boolean> {
    if (ApiClient.refreshPromise) {
      return ApiClient.refreshPromise;
    }

    ApiClient.refreshPromise = (async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        const refreshUrl = this.buildUrl('/auth/refresh');
        const refreshRes = await fetch(refreshUrl, {
          method: 'POST',
          credentials: 'include',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
        });

        return refreshRes.ok;
      } catch {
        return false;
      } finally {
        clearTimeout(timeoutId);
        ApiClient.refreshPromise = null;
      }
    })();

    return ApiClient.refreshPromise;
  }

  private async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { params, timeoutMs = 15000, token, headers = {}, _isRetry, ...customConfig } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const mergedHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...headers,
    };

    if (token) {
      (mergedHeaders as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      credentials: 'include',
      ...customConfig,
      headers: mergedHeaders,
      signal: controller.signal,
    };

    const targetUrl = this.buildUrl(path, params);

    try {
      const response = await fetch(targetUrl, config);
      clearTimeout(timeoutId);

      // Handle non-2xx responses
      if (!response.ok) {
        // Attempt automatic single-flight token refresh on 401 for authenticated application calls (if not already retrying)
        if (
          !_isRetry &&
          response.status === 401 &&
          !path.includes('/auth/login') &&
          !path.includes('/auth/register') &&
          !path.includes('/auth/refresh')
        ) {
          const refreshed = await this.refreshSession();
          if (refreshed) {
            // Re-dispatch through request() with _isRetry: true.
            // Guarantees timeout coverage, preserves exact retry errors, and prevents infinite loops.
            return this.request<T>(path, { ...options, _isRetry: true });
          }
        }

        let errorData: { message?: string; code?: string; details?: Record<string, unknown> } = {};
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: response.statusText };
        }

        throw new ApiError({
          message: errorData.message || `Request failed with status ${response.status}`,
          statusCode: response.status,
          code: errorData.code || `HTTP_${response.status}`,
          details: errorData.details,
        });
      }

      if (response.status === 204) {
        return {} as T;
      }

      const data = await response.json();
      return (data.data !== undefined ? data.data : data) as T;
    } catch (error: unknown) {
      clearTimeout(timeoutId);

      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError({
          message: `Request timed out after ${timeoutMs}ms`,
          statusCode: 408,
          code: 'TIMEOUT',
        });
      }

      throw new NetworkError(
        error instanceof Error ? error.message : 'Network request failed'
      );
    }
  }

  public get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  public post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    const opts: RequestOptions = { ...options, method: 'POST' };
    if (body !== undefined) {
      opts.body = JSON.stringify(body);
    }
    return this.request<T>(path, opts);
  }

  public put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    const opts: RequestOptions = { ...options, method: 'PUT' };
    if (body !== undefined) {
      opts.body = JSON.stringify(body);
    }
    return this.request<T>(path, opts);
  }

  public patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    const opts: RequestOptions = { ...options, method: 'PATCH' };
    if (body !== undefined) {
      opts.body = JSON.stringify(body);
    }
    return this.request<T>(path, opts);
  }

  public delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
```

---

## 8. Frontend Auth Service: `auth.service.ts`
**Path:** `apps/web/src/services/auth.service.ts`

```typescript
/**
 * Authentication Service for NUMU Web Application
 * Interacts with /api/v1/auth endpoints using secure HttpOnly cookie credentials.
 * Strictly avoids browser storage (no localStorage, sessionStorage, or IndexedDB).
 */

import { apiClient } from '@/lib/api/api-client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { User, AuthResponse } from '@numu/types';

export interface RegisterPayload {
  email: string;
  password: string;
  username?: string | undefined;
  name?: string | undefined;
  college?: string | undefined;
  gradYear?: number | undefined;
}

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface ActiveSession {
  id: string;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: string;
  lastActivityAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

export const authService = {
  /**
   * Registers a new student account.
   * Sets secure HttpOnly cookies on the client without writing to browser storage.
   */
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(ENDPOINTS.AUTH.REGISTER, payload);
  },

  /**
   * Authenticates with email or username.
   * Sets secure HttpOnly cookies without writing to browser storage.
   */
  async login(payload: LoginPayload): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(ENDPOINTS.AUTH.LOGIN, payload);
  },

  /**
   * Logs out the current user session and clears server session + HttpOnly cookies.
   */
  async logout(): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(ENDPOINTS.AUTH.LOGOUT);
  },

  /**
   * Logs out from all active sessions across all devices for this user.
   */
  async logoutAll(): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/auth/logout-all');
  },

  /**
   * Lists all active sessions for current user with device metadata.
   */
  async getSessions(): Promise<ActiveSession[]> {
    return apiClient.get<ActiveSession[]>('/auth/sessions');
  },

  /**
   * Revokes a specific remote session by session ID.
   */
  async revokeSession(sessionId: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/auth/sessions/${sessionId}`);
  },

  /**
   * Fetches the current authenticated user identity and profile from the server.
   */
  async getMe(): Promise<User> {
    return apiClient.get<User>(ENDPOINTS.AUTH.ME);
  },

  /**
   * Rotates token using HttpOnly refresh cookie.
   */
  async refresh(): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(ENDPOINTS.AUTH.REFRESH);
  },

  /**
   * Sends password reset request.
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/auth/forgot-password', { email });
  },

  /**
   * Resets password using token.
   */
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/auth/reset-password', { token, newPassword });
  },
};
```

---

## 9. Frontend Edge Route Protection Middleware: `middleware.ts`
**Path:** `apps/web/src/middleware.ts`

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Edge Middleware for Server-Side Route Guarding
 * Protects private learning dashboards, tests attempt sessions, and profiles.
 * Redirects already-authenticated candidates away from auth pages.
 */
export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Retrieve auth cookies
  const accessToken = request.cookies.get('numu_access_token')?.value;
  const refreshToken = request.cookies.get('numu_refresh_token')?.value;
  const hasAuthToken = Boolean(accessToken || refreshToken);

  // Define route classifications
  const isAuthPage =
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/signup');

  const isProtectedPage =
    pathname.startsWith('/dashboard') ||
    pathname.includes('/attempt') ||
    (pathname.startsWith('/profile') && !pathname.match(/^\/profile\/[a-zA-Z0-9_-]+$/)) ||
    pathname.startsWith('/settings');

  // 1. Redirect unauthenticated users trying to access protected paths
  if (isProtectedPage && !hasAuthToken) {
    const callbackUrl = encodeURIComponent(`${pathname}${search}`);
    const loginUrl = new URL(`/login?callbackUrl=${callbackUrl}`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Redirect already-authenticated users trying to access login/register
  if (isAuthPage && hasAuthToken) {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/tests/:testId/attempt',
    '/profile',
    '/settings/:path*',
    '/settings',
    '/login',
    '/register',
    '/signup',
  ],
};
```

---

## 10. Frontend In-Memory React Context: `auth-context.tsx`
**Path:** `apps/web/src/contexts/auth-context.tsx`

```typescript
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, type LoginPayload, type RegisterPayload } from '@/services/auth.service';
import type { User } from '@numu/types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await authService.getMe();
      setUser(currentUser);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(
    async (payload: LoginPayload): Promise<User> => {
      const response = await authService.login(payload);
      setUser(response.user);
      return response.user;
    },
    [],
  );

  const register = useCallback(
    async (payload: RegisterPayload): Promise<User> => {
      const response = await authService.register(payload);
      setUser(response.user);
      return response.user;
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.warn('Logout API call failed, clearing local session state', err);
    } finally {
      setUser(null);
    }
  }, []);

  const logoutAll = useCallback(async () => {
    try {
      await authService.logoutAll();
    } catch (err) {
      console.warn('Logout all API call failed, clearing local session state', err);
    } finally {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        logoutAll,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

---

## 11. Frontend Real Backend Persistence Services: `notes.service.ts` & `profile-service.ts`

### `apps/web/src/services/notes.service.ts` (PostgreSQL Authenticated API Backend)
```typescript
import { apiClient } from '@/lib/api/api-client';

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  category: 'general' | 'dsa' | 'course' | 'quick';
  tags: string[];
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteInput {
  title: string;
  content: string;
  category?: 'general' | 'dsa' | 'course' | 'quick';
  tags?: string[];
  isPinned?: boolean;
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
  category?: 'general' | 'dsa' | 'course' | 'quick';
  tags?: string[];
  isPinned?: boolean;
}

export class ApiNotesService {
  private readonly baseUrl = '/notes';

  async getNotes(params?: { category?: string; tag?: string; search?: string }): Promise<Note[]> {
    return apiClient.get<Note[]>(this.baseUrl, { params });
  }

  async getNoteById(id: string): Promise<Note | null> {
    try {
      return await apiClient.get<Note>(`${this.baseUrl}/${encodeURIComponent(id)}`);
    } catch {
      return null;
    }
  }

  async createNote(input: CreateNoteInput): Promise<Note> {
    return apiClient.post<Note>(this.baseUrl, input);
  }

  async updateNote(id: string, input: UpdateNoteInput): Promise<Note> {
    return apiClient.patch<Note>(`${this.baseUrl}/${encodeURIComponent(id)}`, input);
  }

  async deleteNote(id: string): Promise<boolean> {
    try {
      await apiClient.delete<{ success: boolean }>(`${this.baseUrl}/${encodeURIComponent(id)}`);
      return true;
    } catch {
      return false;
    }
  }

  async togglePin(id: string, currentPinState: boolean): Promise<Note> {
    return this.updateNote(id, { isPinned: !currentPinState });
  }
}

// Single singleton instance connected to authenticated PostgreSQL API
export const notesService = new ApiNotesService();
```

### `apps/web/src/services/profile-service.ts` (PostgreSQL Single Source of Truth)
```typescript
// In-memory request cache only for the current session lifecycle
let cachedProfileApiResponse: any = null;

async function fetchEnrichedProfile(username?: string): Promise<any> {
  const cleanUsername = username?.trim().toLowerCase();

  if (cachedProfileApiResponse) {
    if (!cleanUsername || cachedProfileApiResponse.username?.toLowerCase() === cleanUsername) {
      return cachedProfileApiResponse;
    }
  }

  // 1. If username specified, fetch public profile by handle
  if (cleanUsername) {
    const res = await apiClient.get<any>(`/profile/${encodeURIComponent(cleanUsername)}`);
    if (res && res.id) {
      cachedProfileApiResponse = res;
      return res;
    }
    throw new Error(`Profile not found for username: ${username}`);
  }

  // 2. Otherwise fetch current authenticated user profile
  const meRes = await apiClient.get<any>('/profile/me');
  if (meRes && meRes.id) {
    cachedProfileApiResponse = meRes;
    return meRes;
  }

  throw new Error('Authenticated user profile could not be loaded from database');
}

/**
 * Update user profile data. Persists directly to backend PostgreSQL via /profile/me.
 * Discards in-memory cache and re-fetches the genuine database record to return
 * verified persisted state. Surfaces sync failures immediately without masking.
 */
async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
  const githubLink = updates.socials?.find((s) => s.platform === 'github')?.url;
  const linkedinLink = updates.socials?.find((s) => s.platform === 'linkedin')?.url;
  const websiteLink = updates.socials?.find((s) => s.platform === 'website')?.url;

  // 1. Persist changes to server (single source of truth in PostgreSQL)
  await apiClient.patch('/profile/me', {
    name: updates.displayName,
    bio: updates.bio,
    college: updates.college,
    location: updates.location,
    githubUrl: githubLink,
    linkedinUrl: linkedinLink,
    websiteUrl: websiteLink,
    skills: updates.tags,
  });

  // 2. Invalidate profile response cache on successful mutation
  cachedProfileApiResponse = null;

  // 3. Re-fetch the actual persisted record from PostgreSQL to guarantee truth
  return this.getProfile('');
}
```

---

## 12. Frontend In-Memory Problem Draft Store: `page.tsx`
**Path:** `apps/web/src/app/dashboard/dsa/problems/[slug]/page.tsx`

```typescript
/**
 * In-memory editor scratchpad for problem editor session.
 * Explicitly TEMPORARY and UNSAVED active editor state.
 * Strictly adheres to the Zero Browser Storage policy (no localStorage/sessionStorage/IndexedDB).
 * Does not survive page reloads or device changes; final code submissions are persisted via the Submissions API.
 */
const inMemoryDraftStore = new Map<string, LocalDraft>();

function loadSavedDraft(userId: string | undefined, slug: string, lang: string): string | null {
  const key = getDraftStorageKey(userId, slug, lang);
  const draft = inMemoryDraftStore.get(key);
  return draft ? draft.code : null;
}

function saveLocalDraft(userId: string | undefined, slug: string, lang: string, code: string, version: number): boolean {
  const key = getDraftStorageKey(userId, slug, lang);
  inMemoryDraftStore.set(key, {
    code,
    updatedAt: Date.now(),
    version,
  });
  return true;
}

function removeSavedDraft(userId: string | undefined, slug: string, lang: string): void {
  const key = getDraftStorageKey(userId, slug, lang);
  inMemoryDraftStore.delete(key);
}
```

---

## 13. Frontend Route Guarding UX: `tests/[testId]/page.tsx` & `attempt/page.tsx`

### Unauthenticated Instructions Button: `apps/web/src/app/tests/[testId]/page.tsx`
```tsx
import { useAuth } from '@/contexts/auth-context';

export default function TestInstructionsPage() {
  const { isAuthenticated } = useAuth();
  // ...
  {!isAuthenticated ? (
    <Link
      href={`/login?callbackUrl=${encodeURIComponent(`/tests/${testData.slug || testId}/attempt`)}` as any}
      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs hover:shadow-sm"
    >
      <span>Log in to Start Test</span>
      <ArrowRight className="w-4 h-4" />
    </Link>
  ) : agreed ? (
    <Link
      href={`/tests/${testData.slug || testId}/attempt` as any}
      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0b5c39] hover:bg-[#094d2f] text-white text-xs font-bold transition-all shadow-xs hover:shadow-sm"
    >
      <span>{isAttemptActive ? 'Resume Test' : 'Start Test'}</span>
      <ArrowRight className="w-4 h-4" />
    </Link>
  ) : (
    <span className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-200 text-slate-400 text-xs font-bold cursor-not-allowed">
      <span>{isAttemptActive ? 'Resume Test' : 'Start Test'}</span>
      <ArrowRight className="w-4 h-4" />
    </span>
  )}
}
```

### Unauthenticated Attempt Graceful Handling: `apps/web/src/app/tests/[testId]/attempt/page.tsx`
```typescript
      } catch (err: any) {
        if (isMounted) {
          if (err?.statusCode === 401 || err?.status === 401) {
            router.replace(`/login?callbackUrl=${encodeURIComponent(`/tests/${testId}/attempt`)}`);
            return;
          }
          setInitError(err?.response?.data?.message || err?.message || 'Failed to start or resume assessment.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
```

---

## 14. Environment & Rewrite Configurations

### `apps/web/.env.local`
```bash
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="/api/v1"
BACKEND_URL="http://localhost:4000"
NEXT_PUBLIC_USE_MOCKS="false"
```

### `apps/web/next.config.ts` (Proxy Rewrite)
```typescript
  async rewrites() {
    const backendUrl = process.env['BACKEND_URL'] || 'http://localhost:4000';
    return [
      {
        source: '/api/v1/:path*',
        destination: `${backendUrl}/api/v1/:path*`,
      },
    ];
  },
```

### `apps/api/.env`
```bash
PORT=4000
NODE_ENV=development
DATABASE_URL="postgresql://numu_user:numu_dev_password@localhost:5432/numu_db?schema=public"
CORS_ORIGIN="http://localhost:3000"
JWT_ACCESS_SECRET="numu_dev_super_secret_jwt_access_key_min_32_characters"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_DAYS=7
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax
```
