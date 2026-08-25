import { expect } from 'chai';
import type { Server } from 'node:http';
import { createApp } from '../../src/app.js';
import { prisma } from '../../src/config/prisma.js';
import { resetDatabase } from './helpers.js';

interface Json {
  [key: string]: unknown;
}

describe('shared notes (integration)', () => {
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

  async function ownerWithNote(email: string) {
    const registered = await call('POST', '/api/auth/register', {
      body: { name: 'Owner', email, password: 'Kaif@123' },
    });
    const token = registered.body.accessToken as string;

    const created = await call('POST', '/api/notes', {
      token,
      body: { title: 'Shared plan', content: '<p>first draft</p>' },
    });

    return { token, noteId: (created.body.note as Json).id as string };
  }

  it('sharing twice gives the same link', async () => {
    const { token, noteId } = await ownerWithNote('kaif@example.com');

    const first = await call('POST', `/api/notes/${noteId}/share`, { token });
    const second = await call('POST', `/api/notes/${noteId}/share`, { token });

    expect(first.status).to.equal(200);
    expect(first.body.token).to.be.a('string');
    expect(second.body.token).to.equal(first.body.token);
  });

  it('two share requests at once give the same link', async () => {
    const { token, noteId } = await ownerWithNote('kaif@example.com');

    const [first, second] = await Promise.all([
      call('POST', `/api/notes/${noteId}/share`, { token }),
      call('POST', `/api/notes/${noteId}/share`, { token }),
    ]);

    expect(first.status).to.equal(200);
    expect(second.status).to.equal(200);
    expect(first.body.token).to.equal(second.body.token);

    const shared = await call('GET', `/api/shared/${first.body.token as string}`);
    expect(shared.status).to.equal(200);
  });

  it('anyone with the link can read it', async () => {
    const { token, noteId } = await ownerWithNote('kaif@example.com');
    const { body } = await call('POST', `/api/notes/${noteId}/share`, { token });

    const shared = await call('GET', `/api/shared/${body.token as string}`);

    expect(shared.status).to.equal(200);
    expect((shared.body.note as Json).title).to.equal('Shared plan');
  });

  it('a visitor can edit through the link', async () => {
    const { token, noteId } = await ownerWithNote('kaif@example.com');
    const { body } = await call('POST', `/api/notes/${noteId}/share`, { token });

    const edited = await call('PATCH', `/api/shared/${body.token as string}`, {
      body: { content: '<p>edited by a guest</p>' },
    });

    const asOwner = await call('GET', `/api/notes/${noteId}`, { token });

    expect(edited.status).to.equal(200);
    expect((asOwner.body.note as Json).content).to.equal('<p>edited by a guest</p>');
  });

  it('revoking kills the link', async () => {
    const { token, noteId } = await ownerWithNote('kaif@example.com');
    const { body } = await call('POST', `/api/notes/${noteId}/share`, { token });
    const link = body.token as string;

    const revoked = await call('DELETE', `/api/notes/${noteId}/share`, { token });
    const afterRead = await call('GET', `/api/shared/${link}`);
    const afterWrite = await call('PATCH', `/api/shared/${link}`, { body: { title: 'nope' } });

    expect(revoked.status).to.equal(204);
    expect(afterRead.status).to.equal(404);
    expect(afterWrite.status).to.equal(404);
  });

  it('rejects a token that was never issued', async () => {
    const { status } = await call('GET', `/api/shared/${'a'.repeat(32)}`);

    expect(status).to.equal(404);
  });

  it('rejects a malformed token', async () => {
    const { status } = await call('GET', '/api/shared/not-a-token');

    expect(status).to.equal(400);
  });

  it('another account cannot share your note', async () => {
    const { noteId } = await ownerWithNote('kaif@example.com');
    const intruder = await call('POST', '/api/auth/register', {
      body: { name: 'Qureshi', email: 'qureshi@example.com', password: 'Kaif@123' },
    });

    const { status } = await call('POST', `/api/notes/${noteId}/share`, {
      token: intruder.body.accessToken as string,
    });

    expect(status).to.equal(404);
  });

  it('no link until you share it', async () => {
    const { token, noteId } = await ownerWithNote('kaif@example.com');
    const created = await call('GET', `/api/notes/${noteId}`, { token });

    expect((created.body.note as Json).shareToken).to.equal(null);
  });
});
