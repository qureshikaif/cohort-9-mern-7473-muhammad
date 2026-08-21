import { config } from 'dotenv';

const loaded = config({ path: '.env.test', override: true });

if (loaded.error || !loaded.parsed) {
  console.error(
    '\nNo backend/.env.test found. Integration tests need their own database.\n' +
      'Create it containing:\n\n' +
      '  INTEGRATION_TEST_DATABASE=true\n' +
      '  DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/notes_app_test\n\n' +
      'then run: npm run test:integration\n'
  );
  process.exit(1);
}

if (loaded.parsed.INTEGRATION_TEST_DATABASE !== 'true') {
  console.error(
    '\nRefusing to run. These tests empty the Note and User tables, so .env.test has\n' +
      'to say INTEGRATION_TEST_DATABASE=true to confirm the database is a throwaway one.\n'
  );
  process.exit(1);
}

if (!loaded.parsed.DATABASE_URL) {
  console.error('\nbackend/.env.test needs a DATABASE_URL.\n');
  process.exit(1);
}

process.env.NODE_ENV ??= 'test';
process.env.LOG_LEVEL ??= 'silent';
process.env.JWT_ACCESS_SECRET ??= '9cdf3fe1b5cd08f5c16f51298190d5f1b0cb21a8cb8793168ca97473a268bbc3';
process.env.JWT_REFRESH_SECRET ??= 'e4f05ed690f8b1e5f86741d51cc144fe113de231b6f9693d39f4ed7f90e91f8f';
