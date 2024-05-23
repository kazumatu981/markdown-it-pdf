import fs from 'fs';
import { type Logger } from './logger';
export function readOptions<T>(
    filePath?: string,
    logger?: Logger
): T | undefined {
    let options: T | undefined = undefined;
    if (filePath && fs.existsSync(filePath)) {
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            options = JSON.parse(content) as T;
        } catch (_) {
            // nothing to do
            logger?.warn(
                'Failed to read configuration file: %s, so using default options.',
                filePath
            );
        }
    } else {
        logger?.info(
            'Configuration file not found: %s, so using default options.',
            filePath
        );
    }
    return options;
}
