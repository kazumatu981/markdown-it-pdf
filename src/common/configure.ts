import fs from 'fs';
import { type Logger } from './logger';
import { type PDFOptions } from 'puppeteer';
import { type ContentsMapOptions } from '../core/maps/contents-map';

export interface Range {
    min?: number;
    max?: number;
}
export interface ServerPortOptions {
    retry?: number;
    range?: Range;
}

export interface MarkdownRenderServerOptions
    extends ContentsMapOptions,
        ServerPortOptions {
    port?: number;
    externalUrls?: string[];
}

export type PrinterOptions = Omit<PDFOptions, 'path'>;

export interface MarkdownItPdfRenderServerOptions
    extends MarkdownRenderServerOptions {}
export interface MarkdownItPdfPrinterOptions
    extends MarkdownItPdfRenderServerOptions {
    printerOption?: PrinterOptions;
    outputDir?: string;
}

export function readOptions<T>(
    filePath?: string,
    logger?: Logger
): T | undefined {
    let options: T | undefined = undefined;
    if (filePath && fs.existsSync(filePath)) {
        try {
            if (filePath.endsWith('.json')) {
                options = readJsonOptions<T>(filePath);
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
            'Configuration file not found: %s, so using default options.',
            filePath
        );
    }
    return options;
}

function readJsonOptions<T>(filePath: string): T | undefined {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as T;
}

function readJSOptions<T>(filePath: string): T | undefined {
    const module = require(filePath);
    return module as T;
}
