import type { Server as HttpServer } from 'node:http';
import { Server as SocketServer, type Socket } from 'socket.io';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { verifyAccessToken, type JwtPayload } from '../utils/jwt.js';
import type { Note } from '../services/note.service.js';

interface AuthedSocket extends Socket {
  user?: JwtPayload;
}

let io: SocketServer | undefined;

function roomFor(userId: string): string {
  return `user:${userId}`;
}

function sharedRoom(token: string): string {
  return `shared:${token}`;
}

export function initSocket(httpServer: HttpServer): SocketServer {
  io = new SocketServer(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
    },
  });

  io.use((socket: AuthedSocket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;

    if (!token) {
      if (socket.handshake.auth?.shared === true) return next();
      return next(new Error('Authentication token required'));
    }

    try {
      socket.user = verifyAccessToken(token);
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket: AuthedSocket) => {
    const userId = socket.user?.sub;

    if (userId) {
      void socket.join(roomFor(userId));
    }

    logger.info(`Socket connected: ${socket.id} (user: ${userId ?? 'unknown'})`);

    socket.on('shared:join', (token: unknown) => {
      if (typeof token === 'string' && /^[a-f0-9]{32}$/.test(token)) {
        void socket.join(sharedRoom(token));
      }
    });

    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
}

export function getIO(): SocketServer {
  if (!io) throw new Error('Socket.IO not initialised. Call initSocket() first.');
  return io;
}

export type NoteEvent = 'note:created' | 'note:updated' | 'note:deleted';

export function emitToUser(userId: string, event: NoteEvent, payload: Note | { id: string }): void {
  try {
    io?.to(roomFor(userId)).emit(event, payload);
  } catch (error) {
    logger.error({ err: error, event }, 'Failed to emit a note event');
  }
}

export function emitToShared(token: string, note: Note): void {
  try {
    io?.to(sharedRoom(token)).emit('shared:updated', note);
  } catch (error) {
    logger.error({ err: error }, 'Failed to emit a shared note update');
  }
}
