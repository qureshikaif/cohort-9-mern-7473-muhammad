import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  type JwtPayload,
} from '../utils/jwt.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import type { LoginInput, RegisterInput } from '../validators/auth.validator.js';

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthResult {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
}

const publicFields = { id: true, name: true, email: true, role: true } as const;

// A real bcrypt hash of a throwaway value. Login compares against it when the
// email is unknown so both branches do the same work, otherwise the faster
// no-such-user path would let someone discover accounts by timing alone.
const ABSENT_USER_HASH = '$2b$12$M85q71euChvt3Ug/4N5dLu6y./5VUu0MAuiOTVbZ/tokWlIevYRRq';

// Prisma raises P2002 when a unique index rejects a write. Matched structurally
// so this does not depend on the generated client's error class location.
function isDuplicateEmail(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === 'P2002'
  );
}

function issueTokens(user: PublicUser): Omit<AuthResult, 'user'> {
  const payload: JwtPayload = { sub: user.id, role: user.role };

  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}

export async function registerUser(input: RegisterInput): Promise<AuthResult> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });

  if (existing) {
    throw ApiError.conflict('An account with this email already exists');
  }

  try {
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        password: await hashPassword(input.password),
      },
      select: publicFields,
    });

    return { user, ...issueTokens(user) };
  } catch (error) {
    // Two concurrent signups can both clear the check above. The unique index is
    // what actually decides, so report its rejection as the same conflict.
    if (isDuplicateEmail(error)) {
      throw ApiError.conflict('An account with this email already exists');
    }

    throw error;
  }
}

export async function loginUser(input: LoginInput): Promise<AuthResult> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  const matches = await verifyPassword(input.password, user?.password ?? ABSENT_USER_HASH);

  // One error for both causes, so the response cannot be used to find out which
  // addresses have accounts.
  if (!user || !matches) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const publicUser: PublicUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  return { user: publicUser, ...issueTokens(publicUser) };
}

export async function refreshSession(refreshToken: string): Promise<AuthResult> {
  let payload: JwtPayload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  // verifyRefreshToken casts whatever jwt decoded, so the shape is only a claim
  // until it is checked. Guard before the value reaches a query.
  if (typeof payload.sub !== 'string' || payload.sub.length === 0) {
    throw ApiError.unauthorized('Invalid refresh token');
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: publicFields,
  });

  if (!user) {
    throw ApiError.unauthorized('This account no longer exists');
  }

  return { user, ...issueTokens(user) };
}
