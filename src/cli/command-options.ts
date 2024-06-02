import { LogLevel } from '../common';

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
}
