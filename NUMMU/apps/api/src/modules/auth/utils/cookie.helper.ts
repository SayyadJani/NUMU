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

