import { createServer } from 'node:http';

import { createApp } from './app.js';
import { connectDatabase, disconnectDatabase } from './config/prisma.js';
import { env } from './config/env.js';
import { initSocket } from './sockets/index.js';
import { logger } from './utils/logger.js';

async function bootstrap(): Promise<void> {
  await connectDatabase();

  // Anything after this point owns an open connection pool, so release it before
  // letting a startup failure propagate.
  try {
    const app = createApp();
    const httpServer = createServer(app);

    initSocket(httpServer);

    httpServer.listen(env.PORT, () => {
      logger.info(`Server listening on http://localhost:${env.PORT} [${env.NODE_ENV}]`);
    });

    const shutdown = async (signal: string): Promise<void> => {
      logger.info(`${signal} received, shutting down...`);
      httpServer.close(async () => {
        await disconnectDatabase();
        process.exit(0);
      });
    };

    process.on('SIGINT', () => void shutdown('SIGINT'));
    process.on('SIGTERM', () => void shutdown('SIGTERM'));
  } catch (error) {
    await disconnectDatabase();
    throw error;
  }
}

bootstrap().catch((err) => {
  logger.error({ err }, 'Fatal error during startup');
  process.exit(1);
});
