import { expect } from 'chai';
import type { Server } from 'node:http';
import { createApp } from '../src/app.js';

// These cover the request validation and auth guard, which run before any
// database call, so the suite does not need a live PostgreSQL instance.
describe('auth routes', () => {
  let server: Server;
  let baseUrl: string;

  before((done) => {
    server = createApp().listen(0, () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : 0;
      baseUrl = `http://127.0.0.1:${port}/api/auth`;
      done();
    });
  });

  after((done) => {
    server.close(() => done());
  });

  function post(path: string, body?: unknown): Promise<Response> {
    return fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body ?? {}),
    });
  }

  it('rejects registration with a short password', async () => {
    const res = await post('/register', {
      name: 'Kaif',
      email: 'kaif@example.com',
      password: 'short',
    });

    expect(res.status).to.equal(400);
  });

  it('rejects login without an email', async () => {
    const res = await post('/login', { password: 'long-enough-password' });

    expect(res.status).to.equal(400);
  });

  it('names the offending fields in the error body', async () => {
    const res = await post('/register', { name: 'K', email: 'nope', password: 'short' });
    const body = (await res.json()) as { success: boolean; message: string };

    expect(body.success).to.equal(false);
    expect(body.message).to.equal('Validation failed');
  });

  it('rejects a refresh with no token', async () => {
    const res = await post('/refresh');

    expect(res.status).to.equal(400);
  });

  it('rejects logout without a bearer token', async () => {
    const res = await fetch(`${baseUrl}/logout`, { method: 'POST' });

    expect(res.status).to.equal(401);
  });
});
