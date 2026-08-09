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

/**
 * Keeps the open tab in step with edits made elsewhere. The server puts each
 * connection in a room keyed by the user in its token, so a socket only ever
 * receives that user's notes.
 */
export function useNoteEvents(handlers: NoteEventHandlers): void {
  const { onCreated, onUpdated, onDeleted } = handlers;

  useEffect(() => {
    const token = readSession()?.accessToken;
    if (!token) return;

    const socket: Socket = io(SOCKET_URL, {
      auth: { token },
      // The dashboard already loads over HTTP, so a failed upgrade should leave
      // the page working rather than retrying forever.
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
