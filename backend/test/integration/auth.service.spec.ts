import { expect } from 'chai';
import { prisma } from '../../src/config/prisma.js';
import { loginUser, refreshSession, registerUser } from '../../src/services/auth.service.js';
import { createUser, resetDatabase, statusFrom } from './helpers.js';

describe('auth service (integration)', () => {
  beforeEach(resetDatabase);
  after(() => prisma.$disconnect());

  describe('registerUser', () => {
    it('stores a hashed password and gives back tokens', async () => {
      const result = await registerUser({
        name: 'Kaif',
        email: 'kaif@example.com',
        password: 'a-long-enough-password',
      });

      expect(result.user.email).to.equal('kaif@example.com');
      expect(result.accessToken).to.be.a('string').and.have.lengthOf.above(0);
      expect(result.refreshToken).to.be.a('string').and.have.lengthOf.above(0);

      const stored = await prisma.user.findUnique({ where: { email: 'kaif@example.com' } });
      expect(stored?.password).to.not.equal('a-long-enough-password');
      expect(stored?.password).to.match(/^\$2[aby]\$/);
      expect(stored?.role).to.equal('USER');
    });

    it('does not give back the password hash', async () => {
      const result = await registerUser({
        name: 'Kaif',
        email: 'kaif@example.com',
        password: 'a-long-enough-password',
      });

      expect(result.user).to.not.have.property('password');
    });

    it('rejects a duplicate email with 409', async () => {
      const input = {
        name: 'Kaif',
        email: 'taken@example.com',
        password: 'a-long-enough-password',
      };
      await registerUser(input);

      expect(await statusFrom(() => registerUser(input))).to.equal(409);
    });

    it('two signups with the same email leave one row', async () => {
      const input = {
        name: 'Kaif',
        email: 'race@example.com',
        password: 'a-long-enough-password',
      };

      const results = await Promise.allSettled([registerUser(input), registerUser(input)]);
      const fulfilled = results.filter((r) => r.status === 'fulfilled');

      expect(fulfilled).to.have.lengthOf(1);
      expect(await prisma.user.count({ where: { email: 'race@example.com' } })).to.equal(1);
    });
  });

  describe('loginUser', () => {
    it('accepts the correct password', async () => {
      const { user } = await createUser('the-right-password');

      const result = await loginUser({ email: user.email, password: 'the-right-password' });

      expect(result.user.id).to.equal(user.id);
    });

    it('rejects a wrong password with 401', async () => {
      const { user } = await createUser('the-right-password');

      const status = await statusFrom(() =>
        loginUser({ email: user.email, password: 'the-wrong-password' })
      );

      expect(status).to.equal(401);
    });

    it('rejects an unknown email with 401', async () => {
      const status = await statusFrom(() =>
        loginUser({ email: 'nobody@example.com', password: 'the-right-password' })
      );

      expect(status).to.equal(401);
    });
  });

  describe('refreshSession', () => {
    it('refresh gives a new pair of tokens', async () => {
      const { refreshToken, user } = await createUser();

      const result = await refreshSession(refreshToken);

      expect(result.user.id).to.equal(user.id);
      expect(result.accessToken).to.be.a('string').and.have.lengthOf.above(0);
    });

    it('rejects a malformed token with 401', async () => {
      expect(await statusFrom(() => refreshSession('not-a-jwt'))).to.equal(401);
    });

    it('rejects a token for a deleted account', async () => {
      const { refreshToken, user } = await createUser();
      await prisma.user.delete({ where: { id: user.id } });

      expect(await statusFrom(() => refreshSession(refreshToken))).to.equal(401);
    });
  });
});
