import { config } from 'dotenv';

config({ path: '.env.test' });

process.env.NODE_ENV ??= 'test';
process.env.LOG_LEVEL ??= 'silent';
process.env.JWT_ACCESS_SECRET ??= '9cdf3fe1b5cd08f5c16f51298190d5f1b0cb21a8cb8793168ca97473a268bbc3';
process.env.JWT_REFRESH_SECRET ??= 'e4f05ed690f8b1e5f86741d51cc144fe113de231b6f9693d39f4ed7f90e91f8f';

if (!process.env.DATABASE_URL) {
  console.error(
    '\nNo DATABASE_URL found. Integration tests need a throwaway PostgreSQL database.\n' +
      'Create backend/.env.test containing:\n\n' +
      '  DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/notes_app_test\n\n' +
      'then run: npm run test:integration\n'
  );
  process.exit(1);
}
