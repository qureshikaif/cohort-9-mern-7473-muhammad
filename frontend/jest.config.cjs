module.exports = {
  testEnvironment: 'jsdom',
  // without this jsdom hands jest the esm builds
  testEnvironmentOptions: { customExportConditions: [''] },
  setupFiles: ['<rootDir>/test/polyfills.ts'],
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  testMatch: ['<rootDir>/test/**/*.test.{ts,tsx}'],
  moduleNameMapper: {
    '\\.css$': 'identity-obj-proxy',
    '\\.(svg|png|jpe?g|gif|webp)$': '<rootDir>/test/fileStub.ts',
    // needs the ./ prefix, a bare 'config' also matches one inside testing-library
    '^\\./runtimeConfig$': '<rootDir>/test/configStub.ts',
  },
  coverageReporters: ['lcov', 'text-summary'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/main.tsx', '!src/**/*.d.ts'],
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest',
  },
};
