module.exports = {
  testEnvironment: 'node',
  resetModules: true,
  preset: 'ts-jest',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  collectCoverage: true,
  collectCoverageFrom: ['./src/services/*.*', './src/utils/*.*'],
  coverageThreshold: {
    global: {
      lines: 95,
      statements: 95,
      branches: 95,
      functions: 95,
    },
  },
};
