export interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
}

export const PASSWORD_MIN = 8;
export const PASSWORD_MAX_BYTES = 72;
export const NAME_MIN = 2;
export const NAME_MAX = 80;

const emailPattern = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/;

export function passwordBytes(password: string): number {
  return new TextEncoder().encode(password).length;
}

export function validateEmail(email: string): string | undefined {
  const trimmed = email.trim();

  if (!trimmed) return 'Email is required';
  if (!emailPattern.test(trimmed)) return 'That does not look like an email';
  return undefined;
}

export function validatePassword(password: string): string | undefined {
  if (!password) return 'Password is required';
  if (password.length < PASSWORD_MIN) return `Password must be at least ${PASSWORD_MIN} characters`;
  if (passwordBytes(password) > PASSWORD_MAX_BYTES) return 'Password is too long';
  return undefined;
}

export function validateName(name: string): string | undefined {
  const trimmed = name.trim();

  if (!trimmed) return 'Name is required';
  if (trimmed.length < NAME_MIN) return `Name must be at least ${NAME_MIN} characters`;
  if (trimmed.length > NAME_MAX) return `Name must be ${NAME_MAX} characters or fewer`;
  return undefined;
}
