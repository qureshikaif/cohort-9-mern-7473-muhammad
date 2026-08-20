import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';

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
