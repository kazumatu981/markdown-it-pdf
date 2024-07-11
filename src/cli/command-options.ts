import { type LogLevel } from '../core/log/logger';

/**
 * Represents the command options.
 */
export interface MarkdownItPdfCommandOptions {
    /**
     * The directory containing the markdown, css, and other resources files
     */
    dir?: string;
    /**
     * Output directory
     */
    outputDir?: string;
    /**
     * Configuration file
     */
    config?: string;
    /**
     * Log level
     */
    log?: LogLevel;
    /**
     * mode: the style of config file which is created by init command
     */
    mode?: 'js' | 'json';
}
