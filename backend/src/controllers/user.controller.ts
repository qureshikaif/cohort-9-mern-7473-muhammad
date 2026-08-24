import type { Request, Response } from 'express';
import { changePassword, getProfile } from '../services/user.service.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';
import type { ChangePasswordInput } from '../validators/user.validator.js';

type Body<T> = Request<Record<string, string | string[]>, unknown, T>;

export async function me(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw ApiError.unauthorized();
  }

  const profile = await getProfile(req.user.sub);

  res.status(200).json({ success: true, profile });
}

export async function updatePassword(
  req: Body<ChangePasswordInput>,
  res: Response
): Promise<void> {
  if (!req.user) {
    throw ApiError.unauthorized();
  }

  await changePassword(req.user.sub, req.body);

  logger.info({ userId: req.user.sub }, 'Password changed');
  res.status(204).send();
}
