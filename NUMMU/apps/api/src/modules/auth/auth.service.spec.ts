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
        isRevoked: true, // Already revoked - replay attempt!
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
          expiresAt: new Date(Date.now() - 1000), // Expired absolute maximum
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
          lastActivityAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days inactive (> 7 days)
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
      const sessionMax = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // Only 2 days left in 30-day session
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
            expiresAt: sessionMax, // Capped at session absolute max!
          }),
        }),
      );
    });

    it('should allow legitimate concurrent refresh within 15-second grace window without revocation', async () => {
      const rawToken = 'racing-tab-token';
      const tokenHash = tokenService.hashToken(rawToken);
      const replacementHash = 'successor-hash';

      // The presented token was already rotated 2 seconds ago by another tab
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
          userId: 'user-race',
          sessionId: 'session-race',
          isRevoked: false,
          replacedByTokenHash: null,
          createdAt: new Date(Date.now() - 2000), // created 2 seconds ago (within 15s grace window)
          expiresAt: new Date(Date.now() + 100000),
          session: {
            id: 'session-race',
            isRevoked: false,
            expiresAt: new Date(Date.now() + 100000),
            lastActivityAt: new Date(),
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

    it('should reject and revoke family if successor token was already rotated (replay past one rotation)', async () => {
      const rawToken = 'grandparent-token';
      const tokenHash = tokenService.hashToken(rawToken);
      const childHash = 'child-token-hash';

      mockPrisma.refreshToken.findUnique
        .mockResolvedValueOnce({
          id: 'token-gp',
          tokenHash,
          family: 'family-chain',
          userId: 'user-chain',
          sessionId: 'session-chain',
          isRevoked: true,
          replacedByTokenHash: childHash,
          expiresAt: new Date(Date.now() + 100000),
          user: {
            id: 'user-chain',
            email: 'chain@numu.io',
            username: 'chainuser',
            role: Role.STUDENT,
            isActive: true,
            profile: null,
          },
        })
        .mockResolvedValueOnce({
          id: 'token-child',
          tokenHash: childHash,
          family: 'family-chain',
          userId: 'user-chain',
          sessionId: 'session-chain',
          isRevoked: true,
          replacedByTokenHash: 'grandchild-token-hash', // Successor itself was rotated!
          createdAt: new Date(Date.now() - 2000),
          expiresAt: new Date(Date.now() + 100000),
          session: {
            id: 'session-chain',
            isRevoked: false,
            expiresAt: new Date(Date.now() + 100000),
            lastActivityAt: new Date(),
          },
        });

      await expect(authService.refresh(rawToken)).rejects.toThrow(
        'Security violation: token reuse detected. Please log in again.',
      );

      expect(mockPrisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { family: 'family-chain' },
        data: { isRevoked: true },
      });
    });

    it('should reject and revoke family if successor token is already revoked during grace window', async () => {
      const rawToken = 'revoked-successor-token';
      const tokenHash = tokenService.hashToken(rawToken);
      const childHash = 'revoked-child-hash';

      mockPrisma.refreshToken.findUnique
        .mockResolvedValueOnce({
          id: 'token-p',
          tokenHash,
          family: 'family-revoked-child',
          userId: 'user-rev',
          sessionId: 'session-rev',
          isRevoked: true,
          replacedByTokenHash: childHash,
          expiresAt: new Date(Date.now() + 100000),
          user: {
            id: 'user-rev',
            email: 'rev@numu.io',
            username: 'revuser',
            role: Role.STUDENT,
            isActive: true,
            profile: null,
          },
        })
        .mockResolvedValueOnce({
          id: 'token-child-revoked',
          tokenHash: childHash,
          family: 'family-revoked-child',
          userId: 'user-rev',
          sessionId: 'session-rev',
          isRevoked: true, // Successor was explicitly revoked!
          replacedByTokenHash: null,
          createdAt: new Date(Date.now() - 2000),
          expiresAt: new Date(Date.now() + 100000),
          session: {
            id: 'session-rev',
            isRevoked: false,
            expiresAt: new Date(Date.now() + 100000),
            lastActivityAt: new Date(),
          },
        });

      await expect(authService.refresh(rawToken)).rejects.toThrow(
        'Security violation: token reuse detected. Please log in again.',
      );
    });

    it('should safely resolve rotation conflict via bounded retry without infinite recursion', async () => {
      const rawToken = 'conflict-token';
      const tokenHash = tokenService.hashToken(rawToken);

      // Attempt 1: Reads token as unrevoked, but tx.updateMany returns count 0 (lost rotation race to parallel request)
      // Attempt 2: Re-reads token from DB, finds it replaced, and returns access credentials via grace window
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
          userId: 'user-conflict',
          sessionId: 'session-conflict',
          isRevoked: false,
          replacedByTokenHash: null,
          createdAt: new Date(Date.now() - 50), // Created 50ms ago by winning request
          expiresAt: new Date(Date.now() + 100000),
          session: {
            id: 'session-conflict',
            isRevoked: false,
            expiresAt: new Date(Date.now() + 100000),
            lastActivityAt: new Date(),
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

      // Another request consumed it simultaneously, so updateMany returns count: 0
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

