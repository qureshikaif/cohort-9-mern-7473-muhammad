import { expect } from 'chai';
import { hashPassword, verifyPassword } from '../src/utils/password.js';

describe('password hashing', function () {
  // bcrypt at 12 rounds takes a few hundred ms per call.
  this.timeout(10_000);

  const plain = 'correct-horse-battery';

  it('never stores the plain text password', async () => {
    const hash = await hashPassword(plain);

    expect(hash).to.not.equal(plain);
    expect(hash).to.match(/^\$2[aby]\$/);
  });

  it('accepts the correct password', async () => {
    const hash = await hashPassword(plain);

    expect(await verifyPassword(plain, hash)).to.equal(true);
  });

  it('rejects an incorrect password', async () => {
    const hash = await hashPassword(plain);

    expect(await verifyPassword('wrong-horse-battery', hash)).to.equal(false);
  });

  it('salts each hash so the same password hashes differently', async () => {
    const [first, second] = await Promise.all([hashPassword(plain), hashPassword(plain)]);

    expect(first).to.not.equal(second);
  });
});
