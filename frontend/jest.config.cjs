module.exports = {
  testEnvironment: 'jsdom',
  // without this jsdom hands jest the esm builds
  testEnvironmentOptions: { customExportConditions: [''] },
  setupFiles: ['<rootDir>/test/polyfills.ts'],
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  testMatch: ['<rootDir>/test/**/*.test.{ts,tsx}'],
  moduleNameMapper: {
    '\\.css$': 'identity-obj-proxy',
    // needs the ./ prefix, a bare 'config' also matches one inside testing-library
    '^\\./runtimeConfig$': '<rootDir>/test/configStub.ts',
  },
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest',
  },
};
