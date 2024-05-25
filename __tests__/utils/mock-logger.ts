import { jest } from '@jest/globals';
import { type Logger } from '../../src/common/logger';

export const mockLogger: Logger = {
    trace: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
};
