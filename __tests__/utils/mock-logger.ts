import { jest } from '@jest/globals';
import { type Logger } from '../../src/common/logger';

export const mockLogger: Logger = {
    trace: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
};

export function resetMockLogger() {
    (mockLogger.trace as jest.Mock).mockReset();
    (mockLogger.debug as jest.Mock).mockReset();
    (mockLogger.info as jest.Mock).mockReset();
    (mockLogger.warn as jest.Mock).mockReset();
    (mockLogger.error as jest.Mock).mockReset();
}
