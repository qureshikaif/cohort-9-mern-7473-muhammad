import { expect } from 'chai';
import type { Server } from 'node:http';
import { createApp } from '../src/app.js';
import { signAccessToken } from '../src/utils/jwt.js';

describe('auth routes', () => {
  let server: Server;
  let base_url: string;

  before((done) => {
    server = createApp().listen(0, () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : 0;
      base_url = `http://127.0.0.1:${port}/api/auth`;
      done();
    });
  });

  after((done) => {
    server.close(() => done());
  });

  describe('POST /register', () => {
    it('should give 400 for a short password', async () => {
      const res = await fetch(base_url + '/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Kaif', email: 'kaif@example.com', password: 'short' }),
      });

      expect(res.status).to.equal(400);
    });

    it('400 for a bad email', async () => {
      const res = await fetch(base_url + '/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Kaif',
          email: 'not-an-email',
          password: 'Kaif@123',
        }),
      });

      expect(res.status).to.equal(400);
    });

    it('empty body', async () => {
      const res = await fetch(base_url + '/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      expect(res.status).to.equal(400);
    });

    it('says validation failed in the body', async () => {
      const res = await fetch(base_url + '/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'K', email: 'nope', password: 'short' }),
      });
      const body = (await res.json()) as { success: boolean; message: string };

      expect(body.success).to.equal(false);
      expect(body.message).to.equal('Validation failed');
    });
  });

  describe('POST /login', () => {
    it('login fail without email', async () => {
      const res = await fetch(base_url + '/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: 'Kaif@123' }),
      });

      expect(res.status).to.equal(400);
    });

    it('should give 400 when the password is empty', async () => {
      const res = await fetch(base_url + '/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'kaif@example.com', password: '' }),
      });

      expect(res.status).to.equal(400);
    });
  });

  describe('POST /refresh', () => {
    it('should give 400 when there is no refresh token', async () => {
      const res = await fetch(base_url + '/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      expect(res.status).to.equal(400);
    });
  });

  describe('POST /logout', () => {
    it('should give 401 without a token', async () => {
      const res = await fetch(base_url + '/logout', { method: 'POST' });

      expect(res.status).to.equal(401);
    });

    it('garbage token', async () => {
      const res = await fetch(base_url + '/logout', {
        method: 'POST',
        headers: { Authorization: 'Bearer not-a-real-jwt' },
      });

      expect(res.status).to.equal(401);
    });

    it('works with a real token', async () => {
      const token = signAccessToken({ sub: 'user-1', role: 'USER' });

      const res = await fetch(base_url + '/logout', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token },
      });

      expect(res.status).to.equal(204);
    });
  });

  it('should give 404 for a route that does not exist', async () => {
    const res = await fetch(base_url + '/does-not-exist', { method: 'POST' });

    expect(res.status).to.equal(404);
  });
});
