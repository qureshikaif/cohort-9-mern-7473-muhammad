import { ApiError, listNotes, login, readSession, writeSession } from '../src/lib/api';
import type { Session } from '../src/lib/types';

const session: Session = {
  user: { id: 'u1', name: 'Kaif', email: 'kaif@example.com', role: 'USER' },
  accessToken: 'access-1',
  refreshToken: 'refresh-1',
};

function jsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: '',
    json: async () => body,
  } as Response;
}

function authHeader(call: unknown[]): string | undefined {
  const init = call[1] as RequestInit;
  return (init.headers as Record<string, string>).Authorization;
}

describe('session storage', () => {
  it('round-trips a session', () => {
    writeSession(session);

    expect(readSession()?.accessToken).toBe('access-1');
  });

  it('discards a corrupted entry rather than throwing', () => {
    localStorage.setItem('notes-app.session', 'not json');

    expect(readSession()).toBeNull();
    expect(localStorage.getItem('notes-app.session')).toBeNull();
  });
});

describe('login', () => {
  it('surfaces the API message and field errors as an ApiError', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse(400, {
        message: 'Validation failed',
        details: { fieldErrors: { email: ['A valid email is required'] } },
      })
    );

    await expect(login('nope', 'secret')).rejects.toMatchObject({
      status: 400,
      message: 'Validation failed',
      fieldErrors: { email: ['A valid email is required'] },
    });
  });

  it('falls back to a generic message when the body is not JSON', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 502,
      statusText: 'Bad Gateway',
      json: async () => {
        throw new Error('not json');
      },
    } as unknown as Response);

    await expect(login('a@b.com', 'secret')).rejects.toThrow('Bad Gateway');
  });
});

describe('authenticated requests', () => {
  it('refreshes once and replays the original request after a 401', async () => {
    writeSession(session);

    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse(401, { message: 'Invalid or expired token' }))
      .mockResolvedValueOnce(jsonResponse(200, { ...session, accessToken: 'access-2' }))
      .mockResolvedValueOnce(jsonResponse(200, { items: [], total: 0, page: 1, limit: 20 }));
    global.fetch = fetchMock;

    const result = await listNotes('');

    expect(result.total).toBe(0);
    expect(fetchMock).toHaveBeenCalledTimes(3);

    // first attempt with the stale token, then refresh, then a replay with the new one
    expect(authHeader(fetchMock.mock.calls[0])).toBe('Bearer access-1');
    expect(fetchMock.mock.calls[1][0]).toContain('/auth/refresh');
    expect(authHeader(fetchMock.mock.calls[2])).toBe('Bearer access-2');

    expect(readSession()?.accessToken).toBe('access-2');
  });

  it('clears the session and gives up when the refresh also fails', async () => {
    writeSession(session);

    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse(401, {}))
      .mockResolvedValueOnce(jsonResponse(401, {}));

    await expect(listNotes('')).rejects.toBeInstanceOf(ApiError);
    expect(readSession()).toBeNull();
  });

  it('does not call the API at all when there is no session', async () => {
    const fetchMock = jest.fn();
    global.fetch = fetchMock;

    await expect(listNotes('')).rejects.toMatchObject({ status: 401 });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('encodes the search term into the query string', async () => {
    writeSession(session);
    const fetchMock = jest
      .fn()
      .mockResolvedValue(jsonResponse(200, { items: [], total: 0, page: 1, limit: 20 }));
    global.fetch = fetchMock;

    await listNotes('  meeting notes  ');

    expect(fetchMock.mock.calls[0][0]).toContain('search=meeting%20notes');
  });
});
