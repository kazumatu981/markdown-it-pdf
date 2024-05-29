import { jest } from '@jest/globals';

export function getFirstArgsOf(fn: jest.MockedFunction<any>): unknown[] {
    const firstArgs: unknown[] = [];
    for (let i = 0; i < fn.mock.calls.length; i++) {
        firstArgs.push(fn.mock.calls[i][0] as never);
    }
    return firstArgs;
}
