/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    roots: ['./__tests__'],
    setupFilesAfterEnv: ['dotenv/config', './integrationTestSetup.ts'],
    preset: 'ts-jest',
    testEnvironment: 'node',
  };