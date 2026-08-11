process.env.NODE_ENV ??= 'test';
process.env.LOG_LEVEL ??= 'silent';
process.env.DATABASE_URL ??= 'postgresql://test:test@127.0.0.1:5432/test';
process.env.JWT_ACCESS_SECRET ??= 'test-access-secret-not-for-real-use-01';
process.env.JWT_REFRESH_SECRET ??= 'test-refresh-secret-not-for-real-use-1';
