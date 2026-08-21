import { z } from 'zod';
import { MAX_PASSWORD_BYTES, passwordByteLength } from '../utils/password.js';

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Your current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .refine(
        (value) => passwordByteLength(value) <= MAX_PASSWORD_BYTES,
        `Password must be at most ${MAX_PASSWORD_BYTES} bytes`
      ),
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'The new password must be different',
    path: ['newPassword'],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
