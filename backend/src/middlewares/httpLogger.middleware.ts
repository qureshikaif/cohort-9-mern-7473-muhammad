import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Level } from 'pino';
import { pinoHttp } from 'pino-http';
import { logger } from '../utils/logger.js';

export const httpLogger = pinoHttp({
  logger,
  customLogLevel(_req: IncomingMessage, res: ServerResponse, err?: Error): Level {
    if (err || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
});
