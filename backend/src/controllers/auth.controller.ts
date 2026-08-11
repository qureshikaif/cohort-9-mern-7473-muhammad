import type { Request, Response } from 'express';
import { loginUser, refreshSession, registerUser } from '../services/auth.service.js';
import { logger } from '../utils/logger.js';
import type { LoginInput, RefreshInput, RegisterInput } from '../validators/auth.validator.js';

type Body<T> = Request<Record<string, string | string[]>, unknown, T>;

export async function register(req: Body<RegisterInput>, res: Response): Promise<void> {
  const result = await registerUser(req.body);

  logger.info({ userId: result.user.id }, 'User registered');
  res.status(201).json({ success: true, ...result });
}

export async function login(req: Body<LoginInput>, res: Response): Promise<void> {
  const result = await loginUser(req.body);

  logger.info({ userId: result.user.id }, 'User logged in');
  res.status(200).json({ success: true, ...result });
}

export async function refresh(req: Body<RefreshInput>, res: Response): Promise<void> {
  const result = await refreshSession(req.body.refreshToken);

  res.status(200).json({ success: true, ...result });
}

export function logout(req: Request, res: Response): void {
  logger.info({ userId: req.user?.sub }, 'User logged out');
  res.status(204).send();
}
