import fsPromises from 'fs/promises';
import fs from 'fs';
import { type Logger } from './logger';

export async function readOptions<T>(
    filePath?: string,
    logger?: Logger
): Promise<T | undefined> {
    let options: T | undefined = undefined;
    if (filePath) {
        try {
            // check if the file exists
            await fsPromises.access(
                filePath,
                fs.constants.R_OK | fs.constants.F_OK
            );
            if (filePath.endsWith('.json')) {
                options = await readJsonOptions<T>(filePath);
            } else if (filePath.endsWith('.js') || filePath.endsWith('.cjs')) {
                options = readJSOptions<T>(filePath);
            } else {
                logger?.warn(
                    'Unsupported configuration file extension: %s, so using default options.',
                    filePath
                );
            }
        } catch (_) {
            // nothing to do
            logger?.warn(
                'Failed to read configuration file: %s, so using default options.',
                filePath
            );
        }
    } else {
        logger?.info(
            'Arguments for configure are empty, so using default options.'
        );
    }
    return options;
}

async function readJsonOptions<T>(filePath: string): Promise<T | undefined> {
    const content = await fsPromises.readFile(filePath, 'utf-8');
    return JSON.parse(content) as T;
}

function readJSOptions<T>(filePath: string): T | undefined {
    const module = require(filePath);
    return module as T;
}
