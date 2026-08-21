import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import type { ChangePasswordInput } from '../validators/user.validator.js';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  joinedAt: Date;
  noteCount: number;
}

export async function getProfile(userId: string): Promise<UserProfile> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { notes: true } },
    },
  });

  if (!user) {
    throw ApiError.notFound('Account not found');
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    joinedAt: user.createdAt,
    noteCount: user._count.notes,
  };
}

export async function changePassword(userId: string, input: ChangePasswordInput): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { password: true },
  });

  if (!user) {
    throw ApiError.notFound('Account not found');
  }

  const matches = await verifyPassword(input.currentPassword, user.password);

  if (!matches) {
    throw ApiError.unauthorized('That is not your current password');
  }

  await prisma.user.update({
    where: { id: userId },
    data: { password: await hashPassword(input.newPassword) },
  });
}
