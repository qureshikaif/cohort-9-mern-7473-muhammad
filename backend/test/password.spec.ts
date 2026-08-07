import { expect } from 'chai';
import {
  MAX_PASSWORD_BYTES,
  hashPassword,
  passwordByteLength,
  verifyPassword,
} from '../src/utils/password.js';

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

  it('counts bytes rather than characters, since bcrypt limits bytes', () => {
    expect(passwordByteLength('abc')).to.equal(3);
    expect(passwordByteLength('é')).to.equal(2);
  });

  it('refuses a password past the bcrypt byte limit instead of truncating it', async () => {
    const tooLong = 'a'.repeat(MAX_PASSWORD_BYTES + 1);
    let threw = false;

    try {
      await hashPassword(tooLong);
    } catch {
      threw = true;
    }

    expect(threw).to.equal(true);
  });
});
