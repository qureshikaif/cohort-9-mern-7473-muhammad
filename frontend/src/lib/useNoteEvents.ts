import { useEffect } from 'react';
import { io, type Socket } from 'socket.io-client';
import { readSession } from './api';
import { SOCKET_URL } from './runtimeConfig';
import type { Note } from './types';

export interface NoteEventHandlers {
  onCreated: (note: Note) => void;
  onUpdated: (note: Note) => void;
  onDeleted: (id: string) => void;
}

export function useNoteEvents(handlers: NoteEventHandlers): void {
  const { onCreated, onUpdated, onDeleted } = handlers;

  useEffect(() => {
    const token = readSession()?.accessToken;
    if (!token) return;

    const socket: Socket = io(SOCKET_URL, {
      auth: { token },
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
    });

    socket.on('note:created', onCreated);
    socket.on('note:updated', onUpdated);
    socket.on('note:deleted', ({ id }: { id: string }) => onDeleted(id));

    return () => {
      socket.disconnect();
    };
  }, [onCreated, onUpdated, onDeleted]);
}
