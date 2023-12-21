/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    roots: ['./__tests__'],
    setupFilesAfterEnv: ['./integrationTestSetup.ts'],
    preset: 'ts-jest',
    testEnvironment: 'node',
  };