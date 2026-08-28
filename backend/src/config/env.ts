import 'dotenv/config';
import { z } from 'zod';

const jwtSecret = (name: string) =>
  z
    .string()
    .min(32, `${name} must be at least 32 characters`)
    .refine(
      (value) => !/^replace-me/i.test(value),
      `${name} must be replaced with a real secret (see .env.example)`
    );

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).optional(),
    PORT: z.coerce.number().int().positive().max(65535).default(8080),
    CLIENT_URL: z.string().url().default('http://localhost:5173'),

    DATABASE_URL: z
      .string()
      .min(1, 'DATABASE_URL is required')
      .refine(
        (url) => /^postgres(ql)?:\/\//i.test(url),
        'DATABASE_URL must be a postgres:// or postgresql:// connection string'
      ),

    JWT_ACCESS_SECRET: jwtSecret('JWT_ACCESS_SECRET'),
    JWT_REFRESH_SECRET: jwtSecret('JWT_REFRESH_SECRET'),
    JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
    JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  })
  .refine((config) => config.JWT_ACCESS_SECRET !== config.JWT_REFRESH_SECRET, {
    message: 'JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different',
    path: ['JWT_REFRESH_SECRET'],
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:');
  console.error(JSON.stringify(parsed.error.flatten().fieldErrors, null, 2));
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === 'production';
export const isDev = env.NODE_ENV === 'development';
export const isTest = env.NODE_ENV === 'test';
