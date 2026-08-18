import { expect } from 'chai';
import type { Server } from 'node:http';
import { createApp } from '../src/app.js';
import { signAccessToken } from '../src/utils/jwt.js';

describe('note routes', () => {
  let server: Server;
  let base_url: string;

  const token = signAccessToken({ sub: 'user-1', role: 'USER' });
  const auth = { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' };
  const someId = '11111111-1111-1111-1111-111111111111';

  before((done) => {
    server = createApp().listen(0, () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : 0;
      base_url = `http://127.0.0.1:${port}/api/notes`;
      done();
    });
  });

  after((done) => {
    server.close(() => done());
  });

  describe('without a token', () => {
    it('list needs a token', async () => {
      const res = await fetch(base_url);

      expect(res.status).to.equal(401);
    });

    it('create needs a token', async () => {
      const res = await fetch(base_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Groceries' }),
      });

      expect(res.status).to.equal(401);
    });

    it('delete needs a token', async () => {
      const res = await fetch(base_url + '/' + someId, { method: 'DELETE' });

      expect(res.status).to.equal(401);
    });
  });

  describe('with a token', () => {
    it('create with no title', async () => {
      const res = await fetch(base_url, {
        method: 'POST',
        headers: auth,
        body: JSON.stringify({ content: '<p>body</p>' }),
      });

      expect(res.status).to.equal(400);
    });

    it('empty update', async () => {
      const res = await fetch(base_url + '/' + someId, {
        method: 'PATCH',
        headers: auth,
        body: JSON.stringify({}),
      });

      expect(res.status).to.equal(400);
    });

    it('bad id', async () => {
      const res = await fetch(base_url + '/42', { headers: auth });
      expect(res.status).to.equal(400);
    });

    it('limit too big', async () => {
      const res = await fetch(base_url + '?limit=5000', { headers: auth });
      expect(res.status).to.equal(400);
    });
  });
});
