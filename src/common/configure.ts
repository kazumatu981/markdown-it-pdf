import fsPromises from 'fs/promises';
import fs from 'fs';
import path from 'path';
import { type Logger } from './logger';

class ExtnameToReaderFuncMap<T> {
    private _map: Map<string, (filePath: string) => Promise<T | undefined>>;
    constructor(
        seed: Array<[string, (filePath: string) => Promise<T | undefined>]>
    ) {
        this._map = new Map(seed);
    }

    public get(
        key: string
    ): ((filePath: string) => Promise<T | undefined>) | undefined {
        return this._map.get(key);
    }
}

/**
 * Asynchronously reads the configuration options from a file. Supports JSON and JavaScript files.
 * @param {string} filePath - The path to the configuration file.
 * @param {Logger} logger - The logger instance to use for logging.
 * @returns {Promise<T | undefined>} A promise that resolves to the configuration options or undefined if the file path is empty or the file cannot be read.
 */
export async function readOptions<T>(
    filePath?: string,
    logger?: Logger
): Promise<T | undefined> {
    // define a map of file extensions to reader functions.
    const extnameToReaderFuncMap = new ExtnameToReaderFuncMap<T>([
        ['.json', readJsonOptions],
        ['.js', readJSOptions],
        ['.cjs', readJSOptions],
    ]);

    // If the file path is empty, log a message and return undefined
    if (!filePath) {
        logger?.info(
            'Arguments for configure are empty, so using default options.'
        );
        return undefined;
    }

    let options: T | undefined = undefined;

    try {
        // Check if the file exists
        await fsPromises.access(
            filePath,
            fs.constants.R_OK | fs.constants.F_OK
        );

        const reader = extnameToReaderFuncMap.get(path.extname(filePath));

        if (!reader) {
            logger?.warn(
                'Unsupported configuration file extension: %s, so using default options.',
                filePath
            );
        } else {
            options = await reader(filePath);
        }
    } catch (_) {
        // If there was an error reading the file, log a warning
        logger?.warn(
            'Failed to read configuration file: %s, so using default options.',
            filePath
        );
    }
    // Return the configuration options
    return options;
}

/**
 * Asynchronously reads and parses a JSON file.
 * @param {string} filePath - The path to the JSON file.
 * @returns {Promise<T | undefined>} A promise that resolves to the parsed JSON data, or undefined if the file is empty or cannot be read.
 */
async function readJsonOptions<T>(filePath: string): Promise<T | undefined> {
    try {
        // Read the file content as a string
        const content = await fsPromises.readFile(filePath, 'utf-8');

        // Parse the JSON content and return it
        return JSON.parse(content) as T;
    } catch (error) {
        // If there was an error reading the file or parsing the JSON, return undefined
        return undefined;
    }
}

/**
 * Asynchronously reads and parses a JavaScript file.
 * @param {string} filePath - The path to the JavaScript file.
 * @returns {T | undefined} The parsed JavaScript module, or undefined if the file cannot be read or parsed.
 */
async function readJSOptions<T>(filePath: string): Promise<T | undefined> {
    // Read and parse the JavaScript file
    try {
        // Use Node.js's `require` function to load the module
        const module = await import(filePath);
        // TypeScript does not know about the dynamic nature of `require`,
        // so we need to cast the module to the correct type.
        return module as T;
    } catch (error) {
        // If there was an error reading or parsing the file, return undefined
        return undefined;
    }
}
