const path = require('path');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '.tsx?': ['ts-jest', { diagnostics: false }],
  },
  rootDir: path.resolve(__dirname, 'src'),
  setupFilesAfterEnv: [],
  // Coverage
  collectCoverage: true,
  coverageDirectory: path.resolve(__dirname, 'coverage'),
  coverageReporters: ['json', 'lcov', 'clover'],
  collectCoverageFrom: [
    '**/*.{js,jsx,ts,tsx}',
  ],
  coveragePathIgnorePatterns: [
    'mocks',
    'node_modules',
    '__test__',
    '__tests__',
    '.test.ts',
    '.spec.ts',
    '.ispec.ts',
    '.rspec.ts',
    '.json',
  ],
  reporters: ['default'],
  testPathIgnorePatterns: ['dist/', 'build/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
}
