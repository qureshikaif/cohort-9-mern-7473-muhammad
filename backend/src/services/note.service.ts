import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import type {
  CreateNoteInput,
  ListNotesQuery,
  UpdateNoteInput,
} from '../validators/note.validator.js';

export interface Note {
  id: string;
  title: string;
  content: string;
  shareToken: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface NoteList {
  items: Note[];
  total: number;
  page: number;
  limit: number;
}

const noteFields = {
  id: true,
  title: true,
  content: true,
  shareToken: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function createNote(authorId: string, input: CreateNoteInput): Promise<Note> {
  return prisma.note.create({
    data: { title: input.title, content: input.content, authorId },
    select: noteFields,
  });
}

export async function listNotes(authorId: string, query: ListNotesQuery): Promise<NoteList> {
  const where = {
    authorId,
    ...(query.search && {
      OR: [
        { title: { contains: query.search, mode: 'insensitive' as const } },
        { content: { contains: query.search, mode: 'insensitive' as const } },
      ],
    }),
  };

  const [items, total] = await Promise.all([
    prisma.note.findMany({
      where,
      select: noteFields,
      orderBy: { updatedAt: 'desc' },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
    prisma.note.count({ where }),
  ]);

  return { items, total, page: query.page, limit: query.limit };
}

export async function getNote(authorId: string, id: string): Promise<Note> {
  const note = await prisma.note.findFirst({ where: { id, authorId }, select: noteFields });

  if (!note) {
    throw ApiError.notFound('Note not found');
  }

  return note;
}

export async function updateNote(
  authorId: string,
  id: string,
  input: UpdateNoteInput
): Promise<Note> {
  const { count } = await prisma.note.updateMany({ where: { id, authorId }, data: input });

  if (count === 0) {
    throw ApiError.notFound('Note not found');
  }

  return getNote(authorId, id);
}

export async function deleteNote(authorId: string, id: string): Promise<void> {
  const { count } = await prisma.note.deleteMany({ where: { id, authorId } });

  if (count === 0) {
    throw ApiError.notFound('Note not found');
  }
}
