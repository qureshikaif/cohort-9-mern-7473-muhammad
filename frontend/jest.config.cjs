module.exports = {
  testEnvironment: 'jsdom',
  // jsdom resolves the "browser" export condition by default, which hands Jest
  // the ESM build of packages like @testing-library/dom. Clearing it makes them
  // resolve the CommonJS entry that babel-jest output can actually require.
  testEnvironmentOptions: { customExportConditions: [''] },
  setupFiles: ['<rootDir>/test/polyfills.ts'],
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  testMatch: ['<rootDir>/test/**/*.test.{ts,tsx}'],
  moduleNameMapper: {
    // Stylesheets carry no behaviour worth asserting on, so they resolve to a
    // proxy that hands back whatever class name it is asked for.
    '\\.css$': 'identity-obj-proxy',
    // runtimeConfig.ts reads import.meta.env, which only exists under Vite. The
    // name has to be distinctive: a bare './config' pattern also matches the one
    // @testing-library/dom requires internally.
    '^\\./runtimeConfig$': '<rootDir>/test/configStub.ts',
  },
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest',
  },
};
