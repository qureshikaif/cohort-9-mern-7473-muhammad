import type { RequestHandler } from 'express';
import type { ZodTypeAny } from 'zod';

export function validateBody(schema: ZodTypeAny): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      next(result.error);
      return;
    }

    // Replaced with the parsed value so downstream code gets the trimmed and
    // lowercased fields rather than the raw request body.
    req.body = result.data;
    next();
  };
}
