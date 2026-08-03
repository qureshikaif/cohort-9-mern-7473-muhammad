import express, { type Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

import { env, isDev } from './config/env.js';
import routes from './routes/index.js';
import healthRoutes from './routes/health.routes.js';
import { apiRateLimiter, errorHandler, notFound } from './middlewares/index.js';

export function createApp(): Application {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
  app.use(compression());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  if (isDev) app.use(morgan('dev'));

  // Registered before the limiter so uptime probes never get a 429.
  app.use('/api/health', healthRoutes);
  app.use('/api', apiRateLimiter, routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
