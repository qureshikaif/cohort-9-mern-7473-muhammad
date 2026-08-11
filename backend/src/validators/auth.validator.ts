import { z } from 'zod';
import { MAX_PASSWORD_BYTES, passwordByteLength } from '../utils/password.js';

const email = z.string().trim().toLowerCase().email('A valid email is required');

const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .refine(
    (value) => passwordByteLength(value) <= MAX_PASSWORD_BYTES,
    `Password must be at most ${MAX_PASSWORD_BYTES} bytes`
  );

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
  email,
  password,
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'A refresh token is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
