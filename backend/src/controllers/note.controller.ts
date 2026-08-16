import type { Request, Response } from 'express';
import {
  createNote,
  deleteNote,
  getNote,
  listNotes,
  updateNote,
} from '../services/note.service.js';
import { ApiError } from '../utils/ApiError.js';
import type { JwtPayload } from '../utils/jwt.js';
import { logger } from '../utils/logger.js';
import { listNotesSchema, noteIdSchema } from '../validators/note.validator.js';
import type { CreateNoteInput, UpdateNoteInput } from '../validators/note.validator.js';

type Body<T> = Request<Record<string, string | string[]>, unknown, T>;

function currentUserId(req: { user?: JwtPayload }): string {
  if (!req.user) {
    throw ApiError.unauthorized();
  }

  return req.user.sub;
}

export async function create(req: Body<CreateNoteInput>, res: Response): Promise<void> {
  const authorId = currentUserId(req);
  const note = await createNote(authorId, req.body);

  logger.info({ userId: authorId, noteId: note.id }, 'Note created');
  res.status(201).json({ success: true, note });
}

export async function list(req: Request, res: Response): Promise<void> {
  const query = listNotesSchema.parse(req.query);
  const result = await listNotes(currentUserId(req), query);

  res.status(200).json({ success: true, ...result });
}

export async function getOne(req: Request, res: Response): Promise<void> {
  const { id } = noteIdSchema.parse(req.params);
  const note = await getNote(currentUserId(req), id);

  res.status(200).json({ success: true, note });
}

export async function update(req: Body<UpdateNoteInput>, res: Response): Promise<void> {
  const { id } = noteIdSchema.parse(req.params);
  const authorId = currentUserId(req);
  const note = await updateNote(authorId, id, req.body);

  logger.info({ userId: authorId, noteId: id }, 'Note updated');
  res.status(200).json({ success: true, note });
}

export async function remove(req: Request, res: Response): Promise<void> {
  const { id } = noteIdSchema.parse(req.params);
  const authorId = currentUserId(req);

  await deleteNote(authorId, id);

  logger.info({ userId: authorId, noteId: id }, 'Note deleted');
  res.status(204).send();
}
