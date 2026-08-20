import { config } from 'dotenv';

config({ path: '.env.test' });

process.env.NODE_ENV ??= 'test';
process.env.LOG_LEVEL ??= 'silent';
process.env.JWT_ACCESS_SECRET ??= 'integration-access-secret-not-real-01';
process.env.JWT_REFRESH_SECRET ??= 'integration-refresh-secret-not-real-1';

if (!process.env.DATABASE_URL) {
  console.error(
    '\nNo DATABASE_URL found. Integration tests need a throwaway PostgreSQL database.\n' +
      'Create backend/.env.test containing:\n\n' +
      '  DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/notes_app_test\n\n' +
      'then run: npm run test:integration\n'
  );
  process.exit(1);
}
