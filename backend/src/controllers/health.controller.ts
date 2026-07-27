import type { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';

export async function getHealth(_req: Request, res: Response): Promise<void> {
  let database: string;
  try {
    await prisma.$queryRaw`SELECT 1`;
    database = 'connected';
  } catch {
    database = 'disconnected';
  }

  res.status(200).json({
    success: true,
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database,
  });
}
