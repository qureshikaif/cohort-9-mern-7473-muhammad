import { expect } from 'chai';
import {
  MAX_PASSWORD_BYTES,
  hashPassword,
  passwordByteLength,
  verifyPassword,
} from '../src/utils/password.js';

describe('password utils', function () {
  this.timeout(10000);

  it('should not give back the plain password', async () => {
    const hash = await hashPassword('correct-horse-battery');

    expect(hash).to.not.equal('correct-horse-battery');
  });

  it('should look like a bcrypt hash', async () => {
    const hash = await hashPassword('correct-horse-battery');

    expect(hash.startsWith('$2')).to.equal(true);
  });

  it('should verify the right password', async () => {
    const hash = await hashPassword('correct-horse-battery');
    const ok = await verifyPassword('correct-horse-battery', hash);

    expect(ok).to.equal(true);
  });

  it('should not verify the wrong password', async () => {
    const hash = await hashPassword('correct-horse-battery');
    const ok = await verifyPassword('wrong-horse-battery', hash);

    expect(ok).to.equal(false);
  });

  it('one wrong letter is enough to fail', async () => {
    const hash = await hashPassword('correct-horse-battery');
    const ok = await verifyPassword('correct-horse-batterY', hash);

    expect(ok).to.equal(false);
  });

  it('should give two different hashes for the same password', async () => {
    const hash1 = await hashPassword('correct-horse-battery');
    const hash2 = await hashPassword('correct-horse-battery');

    expect(hash1).to.not.equal(hash2);
    expect(await verifyPassword('correct-horse-battery', hash1)).to.equal(true);
    expect(await verifyPassword('correct-horse-battery', hash2)).to.equal(true);
  });

  it('counts bytes not letters', () => {
    expect(passwordByteLength('abc')).to.equal(3);
    expect(passwordByteLength('é')).to.equal(2);
  });

  it('should throw instead of cutting a too long password', async () => {
    const tooLongPassword = 'a'.repeat(MAX_PASSWORD_BYTES + 1);
    let didThrow = false;

    try {
      await hashPassword(tooLongPassword);
    } catch {
      didThrow = true;
    }

    expect(didThrow).to.equal(true);
  });
});
