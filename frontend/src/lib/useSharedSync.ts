import { useEffect } from 'react';
import { io, type Socket } from 'socket.io-client';
import { readSession } from './api';
import { SOCKET_URL } from './runtimeConfig';
import type { Note } from './types';

export function useSharedSync(token: string | null, onRemote: (note: Note) => void): void {
  useEffect(() => {
    if (!token) return;

    const accessToken = readSession()?.accessToken;

    const socket: Socket = io(SOCKET_URL, {
      auth: accessToken ? { token: accessToken } : { shared: true },
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => socket.emit('shared:join', token));
    socket.on('shared:updated', onRemote);

    return () => {
      socket.disconnect();
    };
  }, [token, onRemote]);
}
