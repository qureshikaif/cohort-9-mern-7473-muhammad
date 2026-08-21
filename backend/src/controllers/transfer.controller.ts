import type { Request, Response } from 'express';
import { exportAsFormat, importNotes } from '../services/transfer.service.js';
import { ApiError } from '../utils/ApiError.js';
import { contentTypeFor } from '../utils/noteFormat.js';
import { logger } from '../utils/logger.js';
import { exportQuerySchema } from '../validators/transfer.validator.js';

function currentUserId(req: Request): string {
  if (!req.user) {
    throw ApiError.unauthorized();
  }

  return req.user.sub;
}

export async function exportAll(req: Request, res: Response): Promise<void> {
  const authorId = currentUserId(req);
  const { format } = exportQuerySchema.parse(req.query);

  const now = new Date();
  const { body, count } = await exportAsFormat(authorId, now, format);
  const filename = `notes-${now.toISOString().slice(0, 10)}.${format}`;

  logger.info({ userId: authorId, count, format }, 'Notes exported');

  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Type', contentTypeFor(format));
  res.status(200).send(body);
}

export async function importAll(req: Request, res: Response): Promise<void> {
  const authorId = currentUserId(req);
  const imported = await importNotes(authorId, req.body);

  logger.info({ userId: authorId, count: imported }, 'Notes imported');
  res.status(201).json({ success: true, imported });
}
