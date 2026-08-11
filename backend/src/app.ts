import express, { type Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';

import { env } from './config/env.js';
import routes from './routes/index.js';
import healthRoutes from './routes/health.routes.js';
import { apiRateLimiter, errorHandler, httpLogger, notFound } from './middlewares/index.js';

export function createApp(): Application {
  const app = express();

  app.use(httpLogger);
  app.use(helmet());
  app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
  app.use(compression());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.use('/api/health', healthRoutes);
  app.use('/api', apiRateLimiter, routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
