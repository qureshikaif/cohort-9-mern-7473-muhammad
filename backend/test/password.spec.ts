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
    const hash = await hashPassword('Kaif@123');

    expect(hash).to.not.equal('Kaif@123');
  });

  it('should look like a bcrypt hash', async () => {
    const hash = await hashPassword('Kaif@123');

    expect(hash.startsWith('$2')).to.equal(true);
  });

  it('should verify the right password', async () => {
    const hash = await hashPassword('Kaif@123');
    const ok = await verifyPassword('Kaif@123', hash);

    expect(ok).to.equal(true);
  });

  it('should not verify the wrong password', async () => {
    const hash = await hashPassword('Kaif@123');
    const ok = await verifyPassword('Wrong@123', hash);

    expect(ok).to.equal(false);
  });

  it('one wrong letter is enough to fail', async () => {
    const hash = await hashPassword('Kaif@123');
    const ok = await verifyPassword('Kaif@124', hash);

    expect(ok).to.equal(false);
  });

  it('should give two different hashes for the same password', async () => {
    const hash1 = await hashPassword('Kaif@123');
    const hash2 = await hashPassword('Kaif@123');

    expect(hash1).to.not.equal(hash2);
    expect(await verifyPassword('Kaif@123', hash1)).to.equal(true);
    expect(await verifyPassword('Kaif@123', hash2)).to.equal(true);
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
