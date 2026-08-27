import type { Request, Response } from 'express';
import {
  createShareLink,
  getSharedNote,
  revokeShareLink,
  updateSharedNote,
} from '../services/share.service.js';
import { emitToShared, emitToUser } from '../sockets/index.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';
import { noteIdSchema } from '../validators/note.validator.js';
import { shareTokenSchema, type SharedUpdateInput } from '../validators/share.validator.js';

type Body<T> = Request<Record<string, string | string[]>, unknown, T>;

function currentUserId(req: { user?: { sub: string } }): string {
  if (!req.user) {
    throw ApiError.unauthorized();
  }

  return req.user.sub;
}

export async function share(req: Request, res: Response): Promise<void> {
  const { id } = noteIdSchema.parse(req.params);
  const authorId = currentUserId(req);
  const token = await createShareLink(authorId, id);

  logger.info({ userId: authorId, noteId: id }, 'Note share link created');
  res.status(200).json({ success: true, token });
}

export async function unshare(req: Request, res: Response): Promise<void> {
  const { id } = noteIdSchema.parse(req.params);
  const authorId = currentUserId(req);

  await revokeShareLink(authorId, id);

  logger.info({ userId: authorId, noteId: id }, 'Note share link revoked');
  res.status(204).send();
}

export async function readShared(req: Request, res: Response): Promise<void> {
  const { token } = shareTokenSchema.parse(req.params);
  const note = await getSharedNote(token);

  res.status(200).json({
    success: true,
    note: { id: note.id, title: note.title, content: note.content, updatedAt: note.updatedAt },
  });
}

export async function writeShared(req: Body<SharedUpdateInput>, res: Response): Promise<void> {
  const { token } = shareTokenSchema.parse(req.params);
  const note = await updateSharedNote(token, req.body);

  emitToShared(token, note);
  emitToUser(note.authorId, 'note:updated', note);

  res.status(200).json({
    success: true,
    note: { id: note.id, title: note.title, content: note.content, updatedAt: note.updatedAt },
  });
}
