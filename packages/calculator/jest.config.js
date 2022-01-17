module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      diagnostics: false,
    },
  },
  coverageReporters: ['json', 'lcov', 'clover', 'text'],
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}"
  ],
  coveragePathIgnorePatterns: [
    "node_modules",
    "__test__",
    ".spec.ts",
    ".ispec.ts",
  ]
};
