import {
  Injectable,
  type CanActivate,
  type ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { type Request } from 'express';
import { TokenService } from '../services/token.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

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
