import { CommandModule, type Argv } from 'yargs';
import { type MarkdownItPdfCommandOptions } from './command-options';

import { ConfigGenerator } from '../core/config/config-generator';
import { DefaultConfigDefines } from '../core/config/default-config-defines';

export class InitModuleCommand
    implements
        CommandModule<MarkdownItPdfCommandOptions, MarkdownItPdfCommandOptions>
{
    public command = 'init [mode]';
    public describe =
        'Initialize a new MarkdownItPDF project and create a config file.';
    public aliases = ['i', 'initialize', 'new'];

    public deprecated = false;

    public builder<MarkdownItPdfCommandOptions>(
        yargs: Argv<MarkdownItPdfCommandOptions>
    ): Argv<MarkdownItPdfCommandOptions> {
        return yargs.positional('mode', {
            alias: 'm',
            describe: 'The mode of the config file.',
            type: 'string',
            demandOption: true,
            default: 'js',
            choices: ['js', 'json'],
        });
    }

    public async handler(options: MarkdownItPdfCommandOptions): Promise<void> {
        const configGenerator = new ConfigGenerator(DefaultConfigDefines);
        const extension = options.mode === 'js' ? 'js' : 'json';
        await configGenerator.generate(`./markdown-it-pdf.config.${extension}`);
    }
}
