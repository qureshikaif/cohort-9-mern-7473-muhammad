import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';
import { verifyAccessToken } from '../utils/jwt.js';

const BEARER = /^Bearer[ \t]+(\S+)$/i;

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const match = BEARER.exec(req.headers.authorization?.trim() ?? '');

  if (!match) {
    throw ApiError.unauthorized('Missing or malformed Authorization header');
  }

  try {
    req.user = verifyAccessToken(match[1]);
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw ApiError.unauthorized('Invalid or expired token');
    }
    throw error;
  }

  next();
}

export function authorize(
  ...roles: string[]
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) throw ApiError.unauthorized();
    if (roles.length && (!req.user.role || !roles.includes(req.user.role))) {
      throw ApiError.forbidden('Insufficient permissions');
    }
    next();
  };
}
