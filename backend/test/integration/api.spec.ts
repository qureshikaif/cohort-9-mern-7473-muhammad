import { expect } from 'chai';
import type { Server } from 'node:http';
import { createApp } from '../../src/app.js';
import { prisma } from '../../src/config/prisma.js';
import { resetDatabase } from './helpers.js';

interface Json {
  [key: string]: unknown;
}

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
      body: { name: 'Test User', email, password: 'Kaif@123' },
    });

    return body.accessToken as string;
  }

  it('health says the db is connected', async () => {
    const { status, body } = await call('GET', '/api/health');

    expect(status).to.equal(200);
    expect(body.database).to.equal('connected');
  });

  it('register then log in', async () => {
    const registered = await call('POST', '/api/auth/register', {
      body: { name: 'Kaif', email: 'kaif@example.com', password: 'Kaif@123' },
    });

    expect(registered.status).to.equal(201);
    expect(registered.body.accessToken).to.be.a('string');
    expect((registered.body.user as Json).password).to.equal(undefined);

    const signedIn = await call('POST', '/api/auth/login', {
      body: { email: 'kaif@example.com', password: 'Kaif@123' },
    });

    expect(signedIn.status).to.equal(200);
    expect((signedIn.body.user as Json).email).to.equal('kaif@example.com');
  });

  it('same email twice gives 409', async () => {
    const body = { name: 'Kaif', email: 'kaif@example.com', password: 'Kaif@123' };
    await call('POST', '/api/auth/register', { body });

    const second = await call('POST', '/api/auth/register', { body });

    expect(second.status).to.equal(409);
  });

  it('refresh gives new tokens', async () => {
    const registered = await call('POST', '/api/auth/register', {
      body: { name: 'Kaif', email: 'kaif@example.com', password: 'Kaif@123' },
    });

    const refreshed = await call('POST', '/api/auth/refresh', {
      body: { refreshToken: registered.body.refreshToken },
    });

    expect(refreshed.status).to.equal(200);
    expect(refreshed.body.accessToken).to.be.a('string');
  });

  it('logout with a token', async () => {
    const token = await signUp('kaif@example.com');

    const { status } = await call('POST', '/api/auth/logout', { token });

    expect(status).to.equal(204);
  });

  it('create, list, read, update and delete a note', async () => {
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

  it('one user cannot see another users notes', async () => {
    const mine = await signUp('kaif@example.com');
    const theirs = await signUp('qureshi@example.com');

    const created = await call('POST', '/api/notes', {
      token: theirs,
      body: { title: 'Theirs', content: '' },
    });
    const id = (created.body.note as Json).id as string;

    expect((await call('GET', '/api/notes', { token: mine })).body.total).to.equal(0);
    expect((await call('GET', `/api/notes/${id}`, { token: mine })).status).to.equal(404);
    expect((await call('DELETE', `/api/notes/${id}`, { token: mine })).status).to.equal(404);
  });

  it('notes need a token', async () => {
    expect((await call('GET', '/api/notes')).status).to.equal(401);
  });

  it('unknown route gives 404', async () => {
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
