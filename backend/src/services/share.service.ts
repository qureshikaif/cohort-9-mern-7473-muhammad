import { randomBytes } from 'node:crypto';
import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import type { Note } from './note.service.js';
import type { SharedUpdateInput } from '../validators/share.validator.js';

export interface SharedNote extends Note {
  shareToken: string;
  authorId: string;
}

const noteFields = {
  id: true,
  title: true,
  content: true,
  shareToken: true,
  createdAt: true,
  updatedAt: true,
} as const;

function newToken(): string {
  return randomBytes(16).toString('hex');
}

export async function createShareLink(authorId: string, noteId: string): Promise<string> {
  const note = await prisma.note.findFirst({
    where: { id: noteId, authorId },
    select: { shareToken: true },
  });

  if (!note) {
    throw ApiError.notFound('Note not found');
  }

  if (note.shareToken) {
    return note.shareToken;
  }

  const shareToken = newToken();

  const { count } = await prisma.note.updateMany({
    where: { id: noteId, authorId, shareToken: null },
    data: { shareToken },
  });

  if (count === 1) {
    return shareToken;
  }

  const claimed = await prisma.note.findFirst({
    where: { id: noteId, authorId },
    select: { shareToken: true },
  });

  if (!claimed?.shareToken) {
    throw ApiError.notFound('Note not found');
  }

  return claimed.shareToken;
}

export async function revokeShareLink(authorId: string, noteId: string): Promise<void> {
  const { count } = await prisma.note.updateMany({
    where: { id: noteId, authorId },
    data: { shareToken: null },
  });

  if (count === 0) {
    throw ApiError.notFound('Note not found');
  }
}

export async function getSharedNote(shareToken: string): Promise<SharedNote> {
  const note = await prisma.note.findUnique({
    where: { shareToken },
    select: { ...noteFields, authorId: true },
  });

  if (!note?.shareToken) {
    throw ApiError.notFound('This link is no longer active');
  }

  return { ...note, shareToken: note.shareToken };
}

export async function updateSharedNote(
  shareToken: string,
  input: SharedUpdateInput
): Promise<SharedNote> {
  const { count } = await prisma.note.updateMany({ where: { shareToken }, data: input });

  if (count === 0) {
    throw ApiError.notFound('This link is no longer active');
  }

  return getSharedNote(shareToken);
}
