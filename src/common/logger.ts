import chalk = require('chalk');

/**
 * Represents a logging method.
 */
type LogMethods = 'trace' | 'debug' | 'info' | 'warn' | 'error';

const methodIndexes = ['trace', 'debug', 'info', 'warn', 'error'];

/**
 * Represents a log level.
 */
export type LogLevel = LogMethods | 'silent';

/**
 * Represents a log level index.
 */
export const levelIndexes = [
    'trace',
    'debug',
    'info',
    'warn',
    'error',
    'silent',
];

/**
 * Represents a logger interface.
 */
export interface Logger {
    /**
     * Logs a trace message.
     * @param message - The message to log.
     */
    trace: (message: unknown, ...args: unknown[]) => void;
    /**
     * Logs a debug message.
     * @param message - The message to log.
     */
    debug: (message: unknown, ...args: unknown[]) => void;
    /**
     * Logs an info message.
     * @param message - The message to log.
     */
    info: (message: unknown, ...args: unknown[]) => void;
    /**
     * Logs a warning message.
     * @param message - The message to log.
     */
    warn: (message: unknown, ...args: unknown[]) => void;
    /**
     * Logs an error message.
     * @param message - The message to log.
     */
    error: (message: unknown, ...args: unknown[]) => void;
}

/**
 * Implements a logger that logs messages to the console.
 */
export class ConsoleLogger implements Logger {
    private level: LogLevel;

    /**
     * Implements a logger that logs messages to the console.
     * @param level {LogLevel} The log level.
     */
    public constructor(level: LogLevel = 'info') {
        this.level = level;
    }
    /**
     * Logs a trace message.
     * @param message - The message to log.
     * @param args - Additional arguments to pass to the log function.
     */
    public trace(message: unknown, ...args: unknown[]): void {
        // Logs a trace message at the trace log level.
        this.log('trace', message, ...args);
    }
    /**
     * Logs a debug message.
     * @param message - The message to log.
     * @param args - Additional arguments to pass to the log function.
     */
    public debug(message: unknown, ...args: unknown[]): void {
        // Logs a debug message at the debug log level.
        this.log('debug', message, ...args);
    }
    /**
     * Logs an info message.
     * @param message - The message to log.
     * @param args - Additional arguments to pass to the log function.
     */
    public info(message: unknown, ...args: unknown[]): void {
        // Logs an info message at the info log level.
        this.log('info', message, ...args);
    }
    /**
     * Logs a warning message.
     * @param message - The message to log.
     * @param args - Additional arguments to pass to the log function.
     */
    public warn(message: unknown, ...args: unknown[]) {
        // Logs a warning message at the warn log level.
        this.log('warn', message, ...args);
    }
    /**
     * Logs an error message.
     * @param message - The message to log.
     * @param args - Additional arguments to pass to the log function.
     */
    public error(message: unknown, ...args: unknown[]) {
        // Logs an error message at the error log level.
        this.log('error', message, ...args);
    }

    // #region Private Methods
    /**
     * Determines if the specified log level should be logged.
     * @param level - The log level to check.
     * @returns True if the log level should be logged, false otherwise.
     */
    private shouldLog(level: LogLevel): boolean {
        // Get the index of the log level in the list of log levels.
        const levelIndex = methodIndexes.indexOf(level);

        // Get the index of the current log level in the list of log levels.
        const currentLevelIndex = methodIndexes.indexOf(this.level);

        // If the log level index is greater than or equal to the current log level index,
        // then the log level should be logged.
        return levelIndex >= currentLevelIndex;
    }

    /**
     * Creates a log message with the specified log level and message.
     * @param {LogLevel} level - The log level.
     * @param {string} message - The message to log.
     * @returns {string} The log message.
     */
    private createMessage(level: LogLevel, message: unknown): string {
        // Format the log message with the log level, timestamp, and message.
        let levelString: string = level;
        switch (level) {
            case 'trace':
                levelString = chalk.yellowBright(level.toUpperCase());
                break;
            case 'debug':
                levelString = chalk.gray(level.toUpperCase());
                break;
            case 'info':
                levelString = chalk.blue(level.toUpperCase());
                break;
            case 'warn':
                levelString = chalk.redBright(level.toUpperCase());
                break;
            case 'error':
                levelString = chalk.bgRed(level.toUpperCase());
                break;
        }
        const messageString = `[${levelString} ${getCurrentTimeString()}] ${message}`;

        // Return the formatted log message.
        switch (level) {
            case 'trace':
            case 'debug':
                return chalk.gray(messageString);
            default:
                return messageString;
        }
    }

    /**
     * Logs a message at the specified log level.
     * If the log level is lower than the current log level, the message is not logged.
     * @param level The log level to log the message at.
     * @param message The message to log.
     * @param args Any additional arguments to pass to the log function.
     */
    private log(level: LogMethods, message: unknown, ...args: unknown[]) {
        // If the log level is set to 'silent', do not log anything.
        if (this.level === 'silent') return;

        // Get the correct log function based on the log level.
        const logCallBack = console[level];

        // If the log level is high enough to be logged, log the message.
        if (this.shouldLog(level)) {
            // Create the log message with the log level and timestamp.
            const logMessage = this.createMessage(level, message);

            // Log the message using the appropriate log function.
            logCallBack(logMessage, ...args);
        }
    }
    // #endregion
}

/**
 * Returns a string representing the current time in the format "HH:MM:SS".
 * @returns {string} The current time in the format "HH:MM:SS".
 */
function getCurrentTimeString(): string {
    const date = new Date();
    return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
}
