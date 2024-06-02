import { LogLevel } from '../common';

export interface MarkdownItPdfCommandOptions {
    dir?: string;
    outputDir?: string;
    config?: string;
    log?: LogLevel;
}
