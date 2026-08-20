import { prisma } from '../config/prisma.js';
import type { ImportInput } from '../validators/transfer.validator.js';

export interface ExportedNote {
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NoteExport {
  exportedAt: string;
  version: 1;
  notes: ExportedNote[];
}

export async function exportNotes(authorId: string, now: Date): Promise<NoteExport> {
  const notes = await prisma.note.findMany({
    where: { authorId },
    select: { title: true, content: true, createdAt: true, updatedAt: true },
    orderBy: { createdAt: 'asc' },
  });

  return { exportedAt: now.toISOString(), version: 1, notes };
}

export async function importNotes(authorId: string, input: ImportInput): Promise<number> {
  const { count } = await prisma.note.createMany({
    data: input.notes.map((note) => ({ ...note, authorId })),
  });

  return count;
}
