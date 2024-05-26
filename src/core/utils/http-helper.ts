import http from 'http';
import { Logger } from '../../common/logger';
import type { Range, ServerPortOptions } from '../../common/configure';

//#region constants
const privatePortRange = {
    min: 49152,
    max: 65535,
};
//#endregion

//#region types and interfaces
export interface ServerPort {
    /**
     * The port that the server is listening on.
     */
    port: number;
    /**
     * The http server that is listening on the specified port.
     */
    httpServer: http.Server;
}
//#endregion

//#region functions

//#region exported functions
/**
 * Tries to listen on a given port. If the port is not specified, it tries to
 * listen on a random port within a specified range. If the specified port is
 * in use, it retries the specified number of times.
 *
 * @param {number | undefined} port The port to listen on. If not specified, it will try to listen on
 * a random port within the specified range.
 * @param {ServerPortOptions | undefined} options The options for listening on a port.
 * @param {Logger | undefined} logger The logger to log the events.
 * @returns {Promise<ServerPort | undefined>} A promise that resolves to the port that the server is listening on
 * or undefined if the specified port is in use and cannot be listened on.
 */
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
//#endregion

//#region internal functions
/**
 * Generates a random number within a specified range.
 *
 * @param {Range | undefined} range - The range within which the random number
 * should be generated. If not specified, the function will use the default range
 * of 49152 to 65535.
 * @returns {number} A random number within the specified range.
 * @throws {Error} If the range is invalid (min > max).
 */
function getRandom(range?: Range): number {
    // Set the default range if not specified
    const candidate = {
        min: range?.min ?? privatePortRange.min,
        max: range?.max ?? privatePortRange.max,
    };

    // Check if the range is valid
    if (candidate.min > candidate.max) {
        throw new Error('Invalid range');
    }

    // Generate a random number within the range
    return Math.floor(
        Math.random() * (candidate.max - candidate.min) + candidate.min
    );
}

/**
 * Tries to listen on a given port. If the port is in use, it rejects the
 * promise.
 *
 * @param {number} port The port to listen on.
 * @param {Logger | undefined} logger The logger to log the events.
 * @returns {Promise<ServerPort | undefined>} A promise that resolves to the port that the server is listening on
 * or undefined if the specified port is in use and cannot be listened on.
 */
function tryToListenCore(
    port: number,
    logger?: Logger
): Promise<ServerPort | undefined> {
    // Create a new http server
    const server = http.createServer();

    // Create a promise that resolves to the port that the server is listening on
    // or undefined if the specified port is in use and cannot be listened on
    return new Promise((resolve) => {
        // Start listening on the specified port
        server.listen(port, () => {
            // Log the reserved port
            logger?.debug('reserved port: %d', port);
            // Resolve the promise with the port and the server
            resolve({
                port,
                httpServer: server,
            });
        });
        // If there is an error while listening on the port, log the error and
        // resolve the promise with undefined
        server.on('error', (error) => {
            logger?.debug('listen error: %s', error.message);
            logger?.trace(error.stack);
            logger?.warn('port %d may be used.', port);
            resolve(undefined);
        });
    });
}
//#endregion

//#endregion
