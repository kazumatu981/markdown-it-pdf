import { type Argv } from 'yargs';
import { type MarkdownItPdfCommandOptions } from '../cli/command-options';
import path from 'path';
import { readOptions } from './configure';
import {
    MarkdownItPdf,
    MarkdownItfRenderServerOptions,
} from '../markdown-it-pdf';

// exports.command: string (or array of strings) that executes this command when given on the command line, first string may contain positional args
export const command: string = 'serve [dir]';
// exports.aliases: array of strings (or a single string) representing aliases of exports.command, positional args defined in an alias are ignored
export const aliases: string[] = ['s', 'server'];

// exports.describe: string used as the description for the command in help text, use false for a hidden command
export const describe: string = 'Starts the MD to HTML render server';

// exports.builder: object declaring the options the command accepts, or a function accepting and returning a yargs instance
export const builder: (
    yargs: Argv<MarkdownItPdfCommandOptions>
) => Argv<MarkdownItPdfCommandOptions> = (yargs: any) => {
    return yargs.positional('dir', {
        describe:
            'The directory containing the markdown, css, and other resources files',
        type: 'string',
        demandOption: true,
        default: process.cwd(),
        coerce: (dir: string) => path.resolve(process.cwd(), dir),
    });
};

// exports.handler: a function which will be passed the parsed argv.
export const handler = (args: MarkdownItPdfCommandOptions) => {
    const options = readOptions<MarkdownItfRenderServerOptions>(args.config);
    MarkdownItPdf.createRenderServer({
        rootDir: args.dir,
        port: args.port,
        ...options,
    })
        .then((server) => {
            return server.listen();
        })
        .then((port) => {
            console.log(`server started at http://localhost:${port}`);
        })
        .catch((error) => {
            // error
            console.error('error');
        });
};

// exports.deprecated: a boolean (or string) to show deprecation notice.
export const deprecated: boolean | string = false;

export default { command, aliases, describe, builder, handler, deprecated };
