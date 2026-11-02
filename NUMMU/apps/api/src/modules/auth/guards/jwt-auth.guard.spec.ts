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

    it('should throw UnauthorizedException if conditional update affects 0 rows and re-check confirms session revoked', async () => {
      reflector.getAllAndOverride.mockReturnValue(false);
      const { context } = createMockContext({}, { numu_access_token: 'valid.token' });

      tokenService.verifyAccessToken.mockReturnValue({
        sub: 'user-1',
        sid: 'session-revoking-fast',
      } as any);

      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        isActive: true,
      });

      // Initially appears active
      prisma.session.findUnique
        .mockResolvedValueOnce({
          id: 'session-revoking-fast',
          isRevoked: false,
          expiresAt: new Date(Date.now() + 1000000),
          lastActivityAt: new Date(Date.now() - 10 * 60 * 1000),
        })
        .mockResolvedValueOnce({
          // Re-check after 0 rows affected
          id: 'session-revoking-fast',
          isRevoked: true, // Concurrently revoked!
          expiresAt: new Date(Date.now() + 1000000),
        });

      // Update affects 0 rows
      prisma.session.updateMany.mockResolvedValueOnce({ count: 0 });

      await expect(guard.canActivate(context)).rejects.toThrow(
        'Session has been revoked or expired',
      );
    });

    it('should continue and not crash if database update encounters a transient error', async () => {
      reflector.getAllAndOverride.mockReturnValue(false);
      const { context, request } = createMockContext({}, { numu_access_token: 'valid.token' });

      tokenService.verifyAccessToken.mockReturnValue({
        sub: 'user-1',
        sid: 'session-active',
      } as any);

      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        isActive: true,
      });

      prisma.session.findUnique.mockResolvedValue({
        id: 'session-active',
        isRevoked: false,
        expiresAt: new Date(Date.now() + 1000000),
        lastActivityAt: new Date(Date.now() - 10 * 60 * 1000),
      });

      // Database error during activity timestamp update
      prisma.session.updateMany.mockRejectedValueOnce(new Error('Connection pool exhausted'));

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(request.user).toBeDefined();
    });
  });
});

