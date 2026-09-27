// packages/auth/src/jwt.ts
import jwt from 'jsonwebtoken';
import type { JwtPayload, RefreshTokenPayload } from './types';

const DEFAULT_ACCESS_EXPIRY = '1h';
const DEFAULT_REFRESH_EXPIRY = '7d';

/**
 * Sign an Access Token
 */
export function signAccessToken(
  payload: Omit<JwtPayload, 'iat' | 'exp'>,
  secret: string,
  expiresIn: string = DEFAULT_ACCESS_EXPIRY,
): string {
  return jwt.sign(payload, secret, { expiresIn: expiresIn as any });
}

/**
 * Verify and decode an Access Token
 */
export function verifyAccessToken(token: string, secret: string): JwtPayload {
  return jwt.verify(token, secret) as JwtPayload;
}

/**
 * Sign a Refresh Token
 */
export function signRefreshToken(
  payload: Omit<RefreshTokenPayload, 'iat' | 'exp'>,
  secret: string,
  expiresIn: string = DEFAULT_REFRESH_EXPIRY,
): string {
  return jwt.sign(payload, secret, { expiresIn: expiresIn as any });
}

/**
 * Verify and decode a Refresh Token
 */
export function verifyRefreshToken(token: string, secret: string): RefreshTokenPayload {
  return jwt.verify(token, secret) as RefreshTokenPayload;
}
