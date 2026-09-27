// packages/auth/src/password.ts
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Hash plain-text password using bcrypt
 */
export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, SALT_ROUNDS);
}

/**
 * Compare plain-text password with stored bcrypt hash
 */
export async function verifyPassword(plainText: string, hash: string): Promise<boolean> {
  if (!plainText || !hash) return false;
  return bcrypt.compare(plainText, hash);
}
