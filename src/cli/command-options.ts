import { LogLevel } from './logger';

export interface MarkdownItPdfCommandOptions {
    dir?: string;
    outputDir?: string;
    config?: string;
    log?: LogLevel;
}
