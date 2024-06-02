#!/usr/bin/env node

import path from 'path';
import yargs from 'yargs';
import { type Argv } from 'yargs';
import serveModule from './cli/serve-module';
import printModule from './cli/print-module';
import { type MarkdownItPdfCommandOptions } from './cli/command-options';
import { levelIndexes } from './common/logger';
import { resolveFromCwd } from './core/utils/path-resolver';

export default function markdownItPdfCli() {
    // CLI interface
    //  usage markdown-it-pdf <cmd> [dir] [options]
    //  commands: serve, print
    //  options:
    //      -h, --help            output usage information
    //      -v, --version         output the version number
    //      -l, --log <Log Level> Log level
    //      -c, --config <file>   Configuration file

    yargs
        .command<MarkdownItPdfCommandOptions>([serveModule, printModule])
        .options({
            log: {
                alias: 'l',
                describe: 'Log level',
                type: 'string',
                demandOption: false,
                default: levelIndexes[2],
                choices: levelIndexes,
            },
            config: {
                alias: 'c',
                describe: 'Configuration file',
                type: 'string',
                demandOption: false,
                coerce: resolveFromCwd,
            },
        })
        .help()
        .version()
        .alias('h', 'help')
        .alias('v', 'version')
        .scriptName('markdown-it-pdf')
        .usage('$0 <cmd> [options]')
        .parse();
}
