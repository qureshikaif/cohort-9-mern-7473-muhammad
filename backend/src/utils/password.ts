import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

// bcrypt reads only the first 72 bytes of its input and silently ignores the
// rest, so a longer password must be rejected instead of quietly truncated.
// Otherwise two passwords sharing a 72 byte prefix would both unlock the account.
export const MAX_PASSWORD_BYTES = 72;

export function passwordByteLength(plain: string): number {
  return new TextEncoder().encode(plain).length;
}

export function hashPassword(plain: string): Promise<string> {
  if (passwordByteLength(plain) > MAX_PASSWORD_BYTES) {
    throw new Error(`Password exceeds the ${MAX_PASSWORD_BYTES} byte bcrypt limit`);
  }

  return bcrypt.hash(plain, SALT_ROUNDS);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
