import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';
import { isProd } from '../config/env.js';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let details: unknown;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation failed';
    details = err.issues;
  } else if (err instanceof Error) {
    message = err.message;
  }

  const isServerError = statusCode >= 500;

  if (isServerError) {
    logger.error({ err }, message);
  }

  // 5xx messages can carry driver or library internals, so log them but never
  // send them to the client.
  res.status(statusCode).json({
    success: false,
    message: isServerError ? 'Internal Server Error' : message,
    ...(!isServerError && details ? { details } : {}),
    ...(isProd ? {} : { stack: err instanceof Error ? err.stack : undefined }),
  });
}
