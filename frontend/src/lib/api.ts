import type { Note, NoteList, Profile, Session } from './types';

import { API_BASE_URL as BASE_URL } from './runtimeConfig';

const STORAGE_KEY = 'notes-app.session';

export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: Record<string, string[]>;

  constructor(status: number, message: string, fieldErrors: Record<string, string[]> = {}) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export function readSession(): Session | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as Session;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function writeSession(session: Session | null): void {
  if (session) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

interface ErrorBody {
  message?: string;
  details?: { fieldErrors?: Record<string, string[]> };
}

async function toError(response: Response): Promise<ApiError> {
  let body: ErrorBody = {};

  try {
    body = (await response.json()) as ErrorBody;
  } catch {
    // not json
  }

  return new ApiError(
    response.status,
    body.message ?? response.statusText ?? 'Something went wrong',
    body.details?.fieldErrors ?? {}
  );
}

function send(path: string, init: RequestInit, accessToken?: string): Promise<Response> {
  return fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...init.headers,
    },
  });
}

async function authed<T>(path: string, init: RequestInit = {}): Promise<T> {
  const session = readSession();

  if (!session) {
    throw new ApiError(401, 'You are signed out');
  }

  let response = await send(path, init, session.accessToken);

  if (response.status === 401) {
    const refreshed = await tryRefresh(session.refreshToken);

    if (!refreshed) {
      writeSession(null);
      throw new ApiError(401, 'Your session has expired, please sign in again');
    }

    writeSession(refreshed);
    response = await send(path, init, refreshed.accessToken);
  }

  if (!response.ok) {
    throw await toError(response);
  }

  return response.status === 204 ? (undefined as T) : ((await response.json()) as T);
}

async function tryRefresh(refreshToken: string): Promise<Session | null> {
  const response = await send('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) return null;

  return (await response.json()) as Session;
}

async function guest<T>(path: string, body: unknown): Promise<T> {
  const response = await send(path, { method: 'POST', body: JSON.stringify(body) });

  if (!response.ok) {
    throw await toError(response);
  }

  return (await response.json()) as T;
}

export function register(name: string, email: string, password: string): Promise<Session> {
  return guest<Session>('/auth/register', { name, email, password });
}

export function login(email: string, password: string): Promise<Session> {
  return guest<Session>('/auth/login', { email, password });
}

export async function logout(): Promise<void> {
  try {
    await authed<void>('/auth/logout', { method: 'POST' });
  } catch {
    // ignore
  } finally {
    writeSession(null);
  }
}

export function listNotes(search: string): Promise<NoteList> {
  const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
  return authed<NoteList>(`/notes${query}`);
}

export function getNote(id: string): Promise<{ note: Note }> {
  return authed<{ note: Note }>(`/notes/${id}`);
}

export function createNote(title: string, content: string): Promise<{ note: Note }> {
  return authed<{ note: Note }>('/notes', {
    method: 'POST',
    body: JSON.stringify({ title, content }),
  });
}

export function updateNote(id: string, title: string, content: string): Promise<{ note: Note }> {
  return authed<{ note: Note }>(`/notes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ title, content }),
  });
}

export function deleteNote(id: string): Promise<void> {
  return authed<void>(`/notes/${id}`, { method: 'DELETE' });
}

export function getProfile(): Promise<{ profile: Profile }> {
  return authed<{ profile: Profile }>('/users/me');
}

export function exportNotes(): Promise<{ notes: unknown[]; exportedAt: string; version: number }> {
  return authed('/notes/export');
}

export function importNotes(notes: { title: string; content: string }[]): Promise<{
  imported: number;
}> {
  return authed('/notes/import', { method: 'POST', body: JSON.stringify({ notes }) });
}
