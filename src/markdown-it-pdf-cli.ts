#!/usr/bin/env node

import path from 'path';
import yargs from 'yargs';
import serveModule from './cli/serve-module';
import printModule from './cli/print-module';
import { type MarkdownItPdfCommandOptions } from './cli/command-options';
import { levelIndexes } from './common/logger';

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
        .command<MarkdownItPdfCommandOptions>(serveModule)
        .command<MarkdownItPdfCommandOptions>(printModule)
        .option('log', {
            alias: 'l',
            describe: 'Log level',
            type: 'string',
            demandOption: false,
            default: levelIndexes[2],
            choices: levelIndexes,
        })
        .option('config', {
            alias: 'c',
            describe: 'Configuration file',
            type: 'string',
            demandOption: false,
            coerce: (config: string) => path.resolve(process.cwd(), config),
        })
        .alias('h', 'help')
        .alias('v', 'version')
        .help()
        .parse();
}
