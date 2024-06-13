import { type Argv } from 'yargs';

import { type MarkdownItPdfCommandOptions } from './command-options';
import { readOptions, ConsoleLogger } from '../common';
import { resolveFromCwd } from '../core/utils';
import { MarkdownItPdf } from '../';

// exports.command: string (or array of strings) that executes this command when given on the command line, first string may contain positional args
export const command: string = 'serve [dir]';
// exports.aliases: array of strings (or a single string) representing aliases of exports.command, positional args defined in an alias are ignored
export const aliases: string[] = ['s', 'server'];

// exports.describe: string used as the description for the command in help text, use false for a hidden command
export const describe: string = 'Starts the MD to HTML render server';

// exports.builder: object declaring the options the command accepts, or a function accepting and returning a yargs instance
export const builder: (
    yargs: Argv<MarkdownItPdfCommandOptions>
) => Argv<MarkdownItPdfCommandOptions> = (
    yargs: Argv<MarkdownItPdfCommandOptions>
) => {
    return yargs.positional('dir', {
        alias: 'd',
        describe:
            'The directory containing the markdown, css, and other resources files',
        type: 'string',
        demandOption: true,
        default: process.cwd(),
        coerce: resolveFromCwd,
    });
};

export let server: MarkdownItPdf.Server | undefined;

export async function stopServer(): Promise<void> {
    await server?.close();
}

// exports.handler: a function which will be passed the parsed argv.
export const handler: (
    args: MarkdownItPdfCommandOptions
) => Promise<void> = async (args: MarkdownItPdfCommandOptions) => {
    const logger = new ConsoleLogger(args.log);
    logger.info('MarkdownItPDF Render Server is starting...');

    const options = await readOptions<MarkdownItPdf.ServerOptions>(
        args.config,
        logger
    );
    try {
        server = await MarkdownItPdf.createServer(
            args.dir,
            {
                ...options,
            },
            logger
        );

        const port = await server?.listen();
        // success
        logger.info('server started at http://localhost:%d', port);

        // register SIGINT handler
        process.on('SIGINT', async () => {
            // safe stop.....close server!!!
            logger.info('Stopping server...');
            await stopServer();
            process.exit(0);
        });
    } catch (error) {
        // error
        logger.error(
            'Error Occurred while starting server: %s',
            (error as Error).message
        );
        logger.debug((error as Error).stack);
        throw error;
    }
};

// exports.deprecated: a boolean (or string) to show deprecation notice.
export const deprecated: boolean | string = false;

export default {
    command,
    aliases,
    describe,
    builder,
    handler,
    deprecated,
    stopServer,
};
