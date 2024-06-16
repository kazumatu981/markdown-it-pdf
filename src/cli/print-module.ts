import { type Argv } from 'yargs';
import { type MarkdownItPdfCommandOptions } from './command-options';
import { readOptions } from '../common/configure';
import { resolveFromCwd } from '../core/utils';
import { type PrinterOptions, createPrinter } from '../';
import { ConsoleLogger } from '../common';

/**
 * For Yargs interfaces.
 * string (or array of strings) that executes this command when given on the command line,
 * first string may contain positional args
 */
export const command: string = 'print [dir] [outputDir]';

/**
 * array of strings (or a single string) representing aliases of exports.command,
 * positional args defined in an alias are ignored
 */
export const aliases: string[] = ['p', 'pdf'];

/**
 * string used as the description for the command in help text, use false for a hidden command
 *
 */
export const describe: string = 'Starts the MD to HTML render server';

/**
 * object declaring the options the command accepts,
 * or a function accepting and returning a yargs instance
 * @param yargs {Argv<MarkdownItPdfCommandOptions>} - The yargs instance.
 * @returns {Argv<MarkdownItPdfCommandOptions>} - The yargs instance changed by this method.
 */
export const builder: (
    yargs: Argv<MarkdownItPdfCommandOptions>
) => Argv<MarkdownItPdfCommandOptions> = (
    yargs: Argv<MarkdownItPdfCommandOptions>
) => {
    return yargs
        .positional('dir', {
            alias: 'd',
            describe:
                'The directory containing the markdown, css, and other resources files',
            type: 'string',
            demandOption: true,
            default: process.cwd(),
            coerce: resolveFromCwd,
        })
        .positional('outputDir', {
            alias: 'o',
            describe: 'Output directory',
            type: 'string',
            demandOption: true,
            default: process.cwd(),
            coerce: resolveFromCwd,
        });
};

/**
 * exports.handler: a function which will be passed the parsed argv.
 * @param args {MarkdownItPdfCommandOptions} - The arguments from command line.
 */
export const handler: (
    args: MarkdownItPdfCommandOptions
) => Promise<void> = async (args: MarkdownItPdfCommandOptions) => {
    const logger = new ConsoleLogger(args.log);
    logger.info('MarkdownItPDF Printer is starting...');

    try {
        const options = await readOptions<PrinterOptions>(args.config, logger);
        const printer = await createPrinter(
            args.dir,
            args.outputDir,
            {
                ...options,
            },
            logger
        );
        logger.info('ready to print.');
        await printer.printAll();
        // success
        logger.info('%d files printed', printer.availableMarkdownPaths.length);
        logger.debug("printed files's ids:");
        logger.debug(printer.availableMarkdownPaths);
    } catch (error) {
        // error
        logger.error(
            'Error Occurred on printing: %s',
            (error as Error).message
        );
        logger.debug((error as Error).stack);
        throw error;
    }
};

/**
 * this module is not deprecated.
 */
export const deprecated: boolean | string = false;

export default { command, aliases, describe, builder, handler, deprecated };
