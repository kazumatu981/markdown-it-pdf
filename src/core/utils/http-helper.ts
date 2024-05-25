import http from 'http';
import { Logger } from '../../common/logger';
import type {
    Range,
    SafeRange,
    ServerPortOptions,
} from '../../common/configure';

const privatePortRange: SafeRange = {
    min: 49152,
    max: 65535,
};

export interface ServerPort {
    port: number;
    httpServer: http.Server;
}

function getRandom(range?: Range): number {
    const candidate = {
        min: range?.min ?? privatePortRange.min,
        max: range?.max ?? privatePortRange.max,
    };
    if (candidate.min > candidate.max) {
        throw new Error('Invalid range');
    }
    return Math.floor(
        Math.random() * (candidate.max - candidate.min) + candidate.min
    );
}

export async function tryToListen(
    port?: number,
    options?: ServerPortOptions,
    logger?: Logger
): Promise<ServerPort | undefined> {
    let serverPort = undefined;
    if (port != undefined) {
        logger?.debug('Try to Listen on port %d', port);
        serverPort = await tryToListenCore(port, logger);
    } else {
        logger?.debug('Try to Listen on port random mode');
        for (let i = 0; i < (options?.retry ?? 10); i++) {
            port = getRandom(options?.range);
            serverPort = await tryToListenCore(port, logger);
            if (serverPort !== undefined) {
                break; // success
            }
        }
    }
    return serverPort;
}
function tryToListenCore(
    port: number,
    logger?: Logger
): Promise<ServerPort | undefined> {
    const server = http.createServer();
    return new Promise((resolve) => {
        server.listen(port, () => {
            logger?.debug('reserved port: %d', port);
            resolve({
                port,
                httpServer: server,
            });
        });
        server.on('error', (error) => {
            logger?.debug('listen error: %s', error.message);
            logger?.trace(error.stack);
            logger?.warn('port %d may be used.', port);
            resolve(undefined);
        });
    });
}