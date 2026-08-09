import type { Request, Response } from 'express';
import { exportNotes, importNotes } from '../services/transfer.service.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

function currentUserId(req: Request): string {
  if (!req.user) {
    throw ApiError.unauthorized();
  }

  return req.user.sub;
}

export async function exportAll(req: Request, res: Response): Promise<void> {
  const authorId = currentUserId(req);
  const payload = await exportNotes(authorId, new Date());
  const filename = `notes-${payload.exportedAt.slice(0, 10)}.json`;

  logger.info({ userId: authorId, count: payload.notes.length }, 'Notes exported');

  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.status(200).json(payload);
}

export async function importAll(req: Request, res: Response): Promise<void> {
  const authorId = currentUserId(req);
  const imported = await importNotes(authorId, req.body);

  logger.info({ userId: authorId, count: imported }, 'Notes imported');
  res.status(201).json({ success: true, imported });
}
