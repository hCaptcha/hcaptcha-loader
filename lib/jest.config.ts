export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['/node_modules/'],
  coverageDirectory: './coverage',
  moduleNameMapper: {
    "^(\\.\\.?\\/.+)\\.js$": "$1"
    },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        diagnostics: false, // Jest should only test, let typescript validate types separately
      },
    ],
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts']
};
