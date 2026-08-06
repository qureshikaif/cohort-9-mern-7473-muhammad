import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
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

function issueTokens(user: PublicUser): Omit<AuthResult, 'user'> {
  const payload = { sub: user.id, role: user.role };

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

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: await hashPassword(input.password),
    },
    select: publicFields,
  });

  return { user, ...issueTokens(user) };
}

export async function loginUser(input: LoginInput): Promise<AuthResult> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  // An unknown email and a wrong password return the same error, otherwise the
  // response tells an attacker which addresses have accounts.
  if (!user || !(await verifyPassword(input.password, user.password))) {
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
  let payload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw ApiError.unauthorized('Invalid or expired refresh token');
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
