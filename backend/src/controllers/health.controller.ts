import type { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { logger } from '../utils/logger.js';

export async function getHealth(_req: Request, res: Response): Promise<void> {
  let healthy: boolean;
  try {
    await prisma.$queryRaw`SELECT 1`;
    healthy = true;
  } catch (error) {
    logger.error({ err: error }, 'Health check database query failed');
    healthy = false;
  }

  res.status(healthy ? 200 : 503).json({
    success: healthy,
    status: healthy ? 'ok' : 'unhealthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: healthy ? 'connected' : 'disconnected',
  });
}
