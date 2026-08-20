import { prisma } from '../../src/config/prisma.js';
import { registerUser } from '../../src/services/auth.service.js';
import type { AuthResult } from '../../src/services/auth.service.js';

// wipes both tables between tests
export async function resetDatabase(): Promise<void> {
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "Note", "User" RESTART IDENTITY CASCADE');
}

let counter = 0;

// unique email each time so specs do not collide
export function createUser(password = 'a-long-enough-password'): Promise<AuthResult> {
  counter += 1;

  return registerUser({
    name: `Test User ${counter}`,
    email: `user${counter}@example.com`,
    password,
  });
}

export async function statusFrom(run: () => Promise<unknown>): Promise<number | undefined> {
  try {
    await run();
    return undefined;
  } catch (error) {
    return typeof error === 'object' && error !== null && 'statusCode' in error
      ? (error as { statusCode: number }).statusCode
      : -1;
  }
}
