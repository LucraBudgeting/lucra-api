import type { Config } from '@jest/types';

// Jest configuration object
const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@interfaces/(.*)$': '<rootDir>/src/interfaces/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@constants/(.*)$': '<rootDir>/src/constants/$1',
    '^@plugins/(.*)$': '<rootDir>/src/plugins/$1',
    '^@modules/(.*)$': '<rootDir>/src/modules/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@exceptions/(.*)$': '<rootDir>/src/exceptions/$1',
  },
  resolver: undefined,
};

export default config;
