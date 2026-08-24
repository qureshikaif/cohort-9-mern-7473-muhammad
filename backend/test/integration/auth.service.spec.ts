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
        password: 'Kaif@123',
      });

      expect(result.user.email).to.equal('kaif@example.com');
      expect(result.accessToken).to.be.a('string').and.have.lengthOf.above(0);
      expect(result.refreshToken).to.be.a('string').and.have.lengthOf.above(0);

      const stored = await prisma.user.findUnique({ where: { email: 'kaif@example.com' } });
      expect(stored?.password).to.not.equal('Kaif@123');
      expect(stored?.password).to.match(/^\$2[aby]\$/);
      expect(stored?.role).to.equal('USER');
    });

    it('does not give back the password hash', async () => {
      const result = await registerUser({
        name: 'Kaif',
        email: 'kaif@example.com',
        password: 'Kaif@123',
      });

      expect(result.user).to.not.have.property('password');
    });

    it('rejects a duplicate email with 409', async () => {
      const input = {
        name: 'Kaif',
        email: 'kaif@example.com',
        password: 'Kaif@123',
      };
      await registerUser(input);

      expect(await statusFrom(() => registerUser(input))).to.equal(409);
    });

    it('two signups with the same email leave one row', async () => {
      const input = {
        name: 'Kaif',
        email: 'kaif@example.com',
        password: 'Kaif@123',
      };

      const results = await Promise.allSettled([registerUser(input), registerUser(input)]);
      const fulfilled = results.filter((r) => r.status === 'fulfilled');
      const rejected = results.filter((r): r is PromiseRejectedResult => r.status === 'rejected');

      expect(fulfilled).to.have.lengthOf(1);
      expect(rejected).to.have.lengthOf(1);
      expect(rejected[0].reason).to.have.property('statusCode', 409);
      expect(await prisma.user.count({ where: { email: 'kaif@example.com' } })).to.equal(1);
    });
  });

  describe('loginUser', () => {
    it('accepts the correct password', async () => {
      const { user } = await createUser('Kaif@123');

      const result = await loginUser({ email: user.email, password: 'Kaif@123' });

      expect(result.user.id).to.equal(user.id);
    });

    it('rejects a wrong password with 401', async () => {
      const { user } = await createUser('Kaif@123');

      const status = await statusFrom(() =>
        loginUser({ email: user.email, password: 'Wrong@123' })
      );

      expect(status).to.equal(401);
    });

    it('rejects an unknown email with 401', async () => {
      const status = await statusFrom(() =>
        loginUser({ email: 'kaif@example.com', password: 'Kaif@123' })
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
      expect(result.refreshToken).to.be.a('string').and.have.lengthOf.above(0);
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
