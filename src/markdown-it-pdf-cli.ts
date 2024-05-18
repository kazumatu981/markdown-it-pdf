#!/usr/bin/env node

import path from 'path';
import yargs from 'yargs';
import serveModule from './cli/serve-module';
import printModule from './cli/print-module';
import { type MarkdownItPdfCommandOptions } from './cli/command-options';

export default function markdownItPdfCli() {
    // CLI interface
    //  usage markdown-it-pdf <cmd> [dir] [options]
    //  commands: serve, print
    //  options:
    //      -h, --help            output usage information
    //      -v, --version         output the version number
    //      -p, --port <port>     Port to listen on
    //      -c, --config <file>   Configuration file

    yargs
        .scriptName('markdown-it-pdf')
        .usage('$0 <cmd> [options]')
        .option('config', {
            alias: 'c',
            describe: 'Configuration file',
            type: 'string',
            demandOption: false,
            coerce: (config: string) => path.resolve(process.cwd(), config),
        })
        .command<MarkdownItPdfCommandOptions>(serveModule)
        .command<MarkdownItPdfCommandOptions>(printModule)
        .alias('h', 'help')
        .alias('v', 'version')
        .help()
        .parse();
}

function definePrintCommand(yargs: yargs.Argv<{}>): void {
    yargs
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
}
function runPrint(args: yargs.ArgumentsCamelCase<{}>) {
    console.log('print start....');
}
