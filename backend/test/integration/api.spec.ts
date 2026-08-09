import { expect } from 'chai';
import type { Server } from 'node:http';
import { createApp } from '../../src/app.js';
import { prisma } from '../../src/config/prisma.js';
import { resetDatabase } from './helpers.js';

interface Json {
  [key: string]: unknown;
}

// Drives the controllers through real HTTP against a real database, which the
// service specs skip by calling the functions directly and the route specs skip
// by only covering rejections.
describe('api (integration)', () => {
  let server: Server;
  let baseUrl: string;

  before((done) => {
    server = createApp().listen(0, () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : 0;
      baseUrl = `http://127.0.0.1:${port}`;
      done();
    });
  });

  after(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await prisma.$disconnect();
  });

  beforeEach(resetDatabase);

  async function call(
    method: string,
    path: string,
    options: { body?: unknown; token?: string } = {}
  ): Promise<{ status: number; body: Json }> {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      ...(options.body === undefined ? {} : { body: JSON.stringify(options.body) }),
    });

    const body = response.status === 204 ? {} : ((await response.json()) as Json);
    return { status: response.status, body };
  }

  async function signUp(email: string): Promise<string> {
    const { body } = await call('POST', '/api/auth/register', {
      body: { name: 'Test User', email, password: 'a-long-enough-password' },
    });

    return body.accessToken as string;
  }

  it('reports the database as connected on the health endpoint', async () => {
    const { status, body } = await call('GET', '/api/health');

    expect(status).to.equal(200);
    expect(body.database).to.equal('connected');
  });

  it('registers, then signs in with the same credentials', async () => {
    const registered = await call('POST', '/api/auth/register', {
      body: { name: 'Kaif', email: 'kaif@example.com', password: 'a-long-enough-password' },
    });

    expect(registered.status).to.equal(201);
    expect(registered.body.accessToken).to.be.a('string');
    expect((registered.body.user as Json).password).to.equal(undefined);

    const signedIn = await call('POST', '/api/auth/login', {
      body: { email: 'kaif@example.com', password: 'a-long-enough-password' },
    });

    expect(signedIn.status).to.equal(200);
    expect((signedIn.body.user as Json).email).to.equal('kaif@example.com');
  });

  it('rejects a second registration of the same email with 409', async () => {
    const body = { name: 'Kaif', email: 'dup@example.com', password: 'a-long-enough-password' };
    await call('POST', '/api/auth/register', { body });

    const second = await call('POST', '/api/auth/register', { body });

    expect(second.status).to.equal(409);
  });

  it('exchanges a refresh token for a fresh pair', async () => {
    const registered = await call('POST', '/api/auth/register', {
      body: { name: 'Kaif', email: 'kaif@example.com', password: 'a-long-enough-password' },
    });

    const refreshed = await call('POST', '/api/auth/refresh', {
      body: { refreshToken: registered.body.refreshToken },
    });

    expect(refreshed.status).to.equal(200);
    expect(refreshed.body.accessToken).to.be.a('string');
  });

  it('accepts a logout from an authenticated caller', async () => {
    const token = await signUp('kaif@example.com');

    const { status } = await call('POST', '/api/auth/logout', { token });

    expect(status).to.equal(204);
  });

  it('walks a note through create, list, read, update and delete', async () => {
    const token = await signUp('kaif@example.com');

    const created = await call('POST', '/api/notes', {
      token,
      body: { title: 'Groceries', content: '<p>Milk</p>' },
    });
    expect(created.status).to.equal(201);
    const id = (created.body.note as Json).id as string;

    const listed = await call('GET', '/api/notes', { token });
    expect(listed.status).to.equal(200);
    expect(listed.body.total).to.equal(1);

    const read = await call('GET', `/api/notes/${id}`, { token });
    expect(read.status).to.equal(200);
    expect((read.body.note as Json).title).to.equal('Groceries');

    const updated = await call('PATCH', `/api/notes/${id}`, {
      token,
      body: { title: 'Groceries, revised' },
    });
    expect(updated.status).to.equal(200);
    expect((updated.body.note as Json).content).to.equal('<p>Milk</p>');

    const removed = await call('DELETE', `/api/notes/${id}`, { token });
    expect(removed.status).to.equal(204);

    const gone = await call('GET', `/api/notes/${id}`, { token });
    expect(gone.status).to.equal(404);
  });

  it('keeps one user notes out of another user responses', async () => {
    const mine = await signUp('mine@example.com');
    const theirs = await signUp('theirs@example.com');

    const created = await call('POST', '/api/notes', {
      token: theirs,
      body: { title: 'Theirs', content: '' },
    });
    const id = (created.body.note as Json).id as string;

    expect((await call('GET', '/api/notes', { token: mine })).body.total).to.equal(0);
    expect((await call('GET', `/api/notes/${id}`, { token: mine })).status).to.equal(404);
    expect((await call('DELETE', `/api/notes/${id}`, { token: mine })).status).to.equal(404);
  });

  it('refuses note requests without a token', async () => {
    expect((await call('GET', '/api/notes')).status).to.equal(401);
  });

  it('returns a 404 body for an unknown route', async () => {
    const { status, body } = await call('GET', '/api/nothing-here');

    expect(status).to.equal(404);
    expect(body.success).to.equal(false);
  });

  it('returns the signed-in user profile with a note count', async () => {
    const token = await signUp('kaif@example.com');
    await call('POST', '/api/notes', { token, body: { title: 'One', content: '' } });
    await call('POST', '/api/notes', { token, body: { title: 'Two', content: '' } });

    const { status, body } = await call('GET', '/api/users/me', { token });
    const profile = body.profile as Json;

    expect(status).to.equal(200);
    expect(profile.email).to.equal('kaif@example.com');
    expect(profile.noteCount).to.equal(2);
    expect(profile.joinedAt).to.be.a('string');
    expect(profile.password).to.equal(undefined);
  });

  it('refuses the profile endpoint without a token', async () => {
    expect((await call('GET', '/api/users/me')).status).to.equal(401);
  });
});
