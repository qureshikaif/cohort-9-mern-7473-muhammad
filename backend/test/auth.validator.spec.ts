import { expect } from 'chai';
import { loginSchema, registerSchema } from '../src/validators/auth.validator.js';

describe('registerSchema', () => {
  it('should accept a normal user', () => {
    const result = registerSchema.safeParse({
      name: 'Kaif',
      email: 'kaif@example.com',
      password: 'long-enough-password',
    });

    expect(result.success).to.equal(true);
  });

  it('should trim the email', () => {
    const parsed = registerSchema.parse({
      name: 'Kaif',
      email: '   kaif@example.com   ',
      password: 'long-enough-password',
    });

    expect(parsed.email).to.equal('kaif@example.com');
  });

  it('should lowercase the email', () => {
    const parsed = registerSchema.parse({
      name: 'Kaif',
      email: 'KAIF@EXAMPLE.COM',
      password: 'long-enough-password',
    });

    expect(parsed.email).to.equal('kaif@example.com');
  });

  it('should trim the name too', () => {
    const parsed = registerSchema.parse({
      name: '  Kaif  ',
      email: 'kaif@example.com',
      password: 'long-enough-password',
    });

    expect(parsed.name).to.equal('Kaif');
  });

  it('rejects a password of 73 bytes', () => {
    const longPassword = 'a'.repeat(73);

    const result = registerSchema.safeParse({
      name: 'Kaif',
      email: 'kaif@example.com',
      password: longPassword,
    });

    expect(result.success).to.equal(false);
  });

  it('rejects a short password', () => {
    const result = registerSchema.safeParse({
      name: 'Kaif',
      email: 'kaif@example.com',
      password: 'short',
    });

    expect(result.success).to.equal(false);
  });

  it('should reject a bad email', () => {
    const result = registerSchema.safeParse({
      name: 'Kaif',
      email: 'not-an-email',
      password: 'long-enough-password',
    });

    expect(result.success).to.equal(false);
  });

  it('should reject a bad email', () => {
    const result = registerSchema.safeParse({
      name: 'Kaif',
      email: 'kaif@',
      password: 'long-enough-password',
    });

    expect(result.success).to.equal(false);
  });

  it('should reject a one letter name', () => {
    const result = registerSchema.safeParse({
      name: 'K',
      email: 'kaif@example.com',
      password: 'long-enough-password',
    });

    expect(result.success).to.equal(false);
  });

  it('should reject missing fields', () => {
    const result = registerSchema.safeParse({});

    expect(result.success).to.equal(false);
  });

  it('gives back an error for every bad field', () => {
    const result = registerSchema.safeParse({
      name: 'K',
      email: 'nope',
      password: 'short',
    });

    expect(result.success).to.equal(false);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      expect(fieldErrors.name).to.not.equal(undefined);
      expect(fieldErrors.email).to.not.equal(undefined);
      expect(fieldErrors.password).to.not.equal(undefined);
    }
  });
});

describe('loginSchema', () => {
  it('should accept a normal login', () => {
    const result = loginSchema.safeParse({
      email: 'kaif@example.com',
      password: 'long-enough-password',
    });

    expect(result.success).to.equal(true);
  });

  it('should lowercase the email on login as well', () => {
    const parsed = loginSchema.parse({
      email: 'KAIF@Example.com',
      password: 'long-enough-password',
    });

    expect(parsed.email).to.equal('kaif@example.com');
  });

  it('accepts a short password because old accounts may have one', () => {
    const result = loginSchema.safeParse({
      email: 'kaif@example.com',
      password: 'x',
    });

    expect(result.success).to.equal(true);
  });

  it('rejcts an empty password', () => {
    const result = loginSchema.safeParse({
      email: 'kaif@example.com',
      password: '',
    });

    expect(result.success).to.equal(false);
  });

  it('rejects a login with no email', () => {
    const result = loginSchema.safeParse({
      password: 'long-enough-password',
    });

    expect(result.success).to.equal(false);
  });
});
