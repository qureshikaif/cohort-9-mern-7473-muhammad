import type { Request, Response } from 'express';
import { getProfile } from '../services/user.service.js';
import { ApiError } from '../utils/ApiError.js';

export async function me(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw ApiError.unauthorized();
  }

  const profile = await getProfile(req.user.sub);

  res.status(200).json({ success: true, profile });
}
