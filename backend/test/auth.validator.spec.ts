import { expect } from 'chai';
import { loginSchema, registerSchema } from '../src/validators/auth.validator.js';

describe('registerSchema', () => {
  const valid = { name: 'Kaif', email: 'Kaif@Example.com', password: 'long-enough-password' };

  it('trims and lowercases the email', () => {
    const parsed = registerSchema.parse({ ...valid, email: '  Kaif@Example.COM  ' });

    expect(parsed.email).to.equal('kaif@example.com');
  });

  it('rejects a password under 8 characters', () => {
    expect(registerSchema.safeParse({ ...valid, password: 'short' }).success).to.equal(false);
  });

  it('rejects a malformed email', () => {
    expect(registerSchema.safeParse({ ...valid, email: 'not-an-email' }).success).to.equal(false);
  });

  it('rejects a name under 2 characters', () => {
    expect(registerSchema.safeParse({ ...valid, name: 'K' }).success).to.equal(false);
  });

  it('reports every invalid field at once', () => {
    const result = registerSchema.safeParse({ name: 'K', email: 'nope', password: 'short' });

    expect(result.success).to.equal(false);
    if (!result.success) {
      expect(Object.keys(result.error.flatten().fieldErrors)).to.have.members([
        'name',
        'email',
        'password',
      ]);
    }
  });
});

describe('loginSchema', () => {
  it('accepts any non-empty password so old accounts can still sign in', () => {
    const result = loginSchema.safeParse({ email: 'kaif@example.com', password: 'x' });

    expect(result.success).to.equal(true);
  });

  it('rejects an empty password', () => {
    const result = loginSchema.safeParse({ email: 'kaif@example.com', password: '' });

    expect(result.success).to.equal(false);
  });
});
