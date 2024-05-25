import { type Argv } from 'yargs';
import path from 'path';
import { type MarkdownItPdfCommandOptions } from './command-options';
import { readOptions, MarkdownItPdfPrinterOptions } from '../common/configure';
import { MarkdownItPdf } from '../markdown-it-pdf';
import { ConsoleLogger } from '../common/logger';
// exports.command: string (or array of strings) that executes this command when given on the command line, first string may contain positional args
export const command: string = 'print [dir] [outputDir]';
// exports.aliases: array of strings (or a single string) representing aliases of exports.command, positional args defined in an alias are ignored
export const aliases: string[] = ['p', 'pdf'];

// exports.describe: string used as the description for the command in help text, use false for a hidden command
export const describe: string = 'Starts the MD to HTML render server';

// exports.builder: object declaring the options the command accepts, or a function accepting and returning a yargs instance
export const builder: (
    yargs: Argv<MarkdownItPdfCommandOptions>
) => Argv<MarkdownItPdfCommandOptions> = (yargs: Argv<{}>) => {
    return yargs
        .positional('dir', {
            alias: 'd',
            describe:
                'The directory containing the markdown, css, and other resources files',
            type: 'string',
            demandOption: true,
            default: process.cwd(),
            coerce: (dir: string) => path.resolve(process.cwd(), dir),
        })
        .positional('outputDir', {
            alias: 'o',
            describe: 'Output directory',
            type: 'string',
            demandOption: true,
            default: process.cwd(),
            coerce: (dir: string) => path.resolve(process.cwd(), dir),
        });
};

// exports.handler: a function which will be passed the parsed argv.
export const handler = (args: MarkdownItPdfCommandOptions) => {
    const logger = new ConsoleLogger(args.log);
    logger.info('MarkdownItPDF Printer is starting...');

    const options = readOptions<MarkdownItPdfPrinterOptions>(
        args.config,
        logger
    );
    MarkdownItPdf.createPdfPrinter(logger, {
        rootDir: args.dir,
        outputDir: args.outputDir,
        ...options,
    })
        .then((printer) => {
            logger.info('ready to print.');
            return printer.printAll();
        })
        .then((printer) => {
            // success
            logger.info(
                '%d files printed',
                printer.availableMarkdownUrls.length
            );
            logger.debug("printed files's ids:");
            logger.debug(printer.availableMarkdownUrls);
        })
        .catch((error: Error) => {
            // error
            logger.error('Error Occurred on printing: %s', error.message);
            logger.debug(error.stack);
        });
};

// exports.deprecated: a boolean (or string) to show deprecation notice.
export const deprecated: boolean | string = false;

export default { command, aliases, describe, builder, handler, deprecated };
