/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/__tests__/unit/**/*.test.ts'],
    collectCoverage: true,
    collectCoverageFrom: ['src/**/*.ts', '!src/index.ts'],
};
