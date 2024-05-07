import http from 'http';

interface Range {
    min?: number;
    max?: number;
}
interface SafeRange {
    min: number;
    max: number;
}
const privatePortRange: SafeRange = {
    min: 49152,
    max: 65535,
};

export interface ServerPort {
    port: number;
    httpServer: http.Server;
}

export interface ServerPortOptions {
    retry?: number;
    range?: Range;
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
    options?: ServerPortOptions
): Promise<ServerPort | undefined> {
    let serverPort = undefined;
    if (port != undefined) {
        serverPort = await tryToListenCore(port);
    } else {
        for (let i = 0; i < (options?.retry ?? 10); i++) {
            port = getRandom(options?.range);
            serverPort = await tryToListenCore(port);
            if (serverPort !== undefined) {
                break; // success
            }
        }
    }
    return serverPort;
}
function tryToListenCore(port: number): Promise<ServerPort | undefined> {
    const server = http.createServer();
    return new Promise((resolve) => {
        server.listen(port, () => {
            resolve({
                port,
                httpServer: server,
            });
        });
        server.on('error', () => {
            resolve(undefined);
        });
    });
}
