import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { type Role } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  email: string;
  username: string | null;
  role: Role;
  sid?: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class TokenService {
  private readonly accessSecret: string;
  private readonly accessExpiresIn: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.accessSecret =
      this.configService.get<string>('JWT_ACCESS_SECRET') ||
      'numu_dev_super_secret_jwt_access_key_min_32_characters';
    this.accessExpiresIn =
      this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m';
  }

  /**
   * Signs a short-lived access JWT token with explicit HS256 algorithm.
   */
  generateAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
    return this.jwtService.sign(payload, {
      secret: this.accessSecret,
      expiresIn: this.accessExpiresIn as unknown as number,
      algorithm: 'HS256',
      jwtid: crypto.randomUUID(),
    });
  }

  /**
   * Verifies and decodes an access JWT token with explicit HS256 algorithm verification.
   */
  verifyAccessToken(token: string): JwtPayload {
    try {
      return this.jwtService.verify<JwtPayload>(token, {
        secret: this.accessSecret,
        algorithms: ['HS256'],
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }

  /**
   * Generates a cryptographically strong unpredictable random token (32 bytes = 64 hex characters).
   */
  generateSecureRandomToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Computes a SHA-256 hex digest of a token for secure database persistence.
   */
  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
