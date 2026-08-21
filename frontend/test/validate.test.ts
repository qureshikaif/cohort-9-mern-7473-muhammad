import { validateEmail, validateName, validatePassword } from '../src/lib/validate';

describe('validateEmail', () => {
  it('accepts a normal address', () => {
    expect(validateEmail('kaif@example.com')).toBeUndefined();
  });

  it('complains when empty', () => {
    expect(validateEmail('   ')).toBe('Email is required');
  });

  it('complains about a missing domain', () => {
    expect(validateEmail('kaif@')).toBe('That does not look like an email');
  });
});

describe('validatePassword', () => {
  it('accepts 8 characters', () => {
    expect(validatePassword('Kaif@123')).toBeUndefined();
  });

  it('rejects a short one', () => {
    expect(validatePassword('short')).toBe('Password must be at least 8 characters');
  });

  it('rejects an empty one', () => {
    expect(validatePassword('')).toBe('Password is required');
  });
});

describe('validateName', () => {
  it('accepts a name', () => {
    expect(validateName('Kaif')).toBeUndefined();
  });

  it('rejects one letter', () => {
    expect(validateName('K')).toBe('Name must be at least 2 characters');
  });
});
