import fsPromises from 'fs/promises';
import fs from 'fs';
import { type Logger } from './logger';
import { type ContentsMapOptions } from '../core/maps/contents-map';
import { type ServerPortOptions } from '../core/utils/http-helper';
import { type PrinterOptions } from '../core/puppeteer-pdf-printer';

export interface MarkdownRenderServerOptions
    extends ContentsMapOptions,
        ServerPortOptions {
    port?: number;
    externalUrls?: string[];
}

export interface MarkdownItPdfRenderServerOptions
    extends MarkdownRenderServerOptions {}
export interface MarkdownItPdfPrinterOptions
    extends MarkdownItPdfRenderServerOptions {
    printerOption?: PrinterOptions;
    outputDir?: string;
}

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

async function  readJsonOptions<T>(filePath: string): Promise<T | undefined> {
    const content = await fsPromises.readFile(filePath, 'utf-8');
    return JSON.parse(content) as T;
}

function readJSOptions<T>(filePath: string): T | undefined {
    const module = require(filePath);
    return module as T;
}
