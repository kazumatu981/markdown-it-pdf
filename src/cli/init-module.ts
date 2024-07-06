import { CommandModule } from 'yargs';
import { type MarkdownItPdfCommandOptions } from './command-options';

import { ConfigGenerator } from '../common/config-generator';
import { DefaultConfigDefine } from '../common/config-define';

export class InitModuleCommand
    implements
        CommandModule<MarkdownItPdfCommandOptions, MarkdownItPdfCommandOptions>
{
    public command = 'init';
    public describe =
        'Initialize a new MarkdownItPDF project and create a config file.';
    public aliases = ['i', 'initialize', 'new'];

    public deprecated = false;

    public async handler(_: MarkdownItPdfCommandOptions): Promise<void> {
        const configGenerator = new ConfigGenerator(DefaultConfigDefine);
        await configGenerator.generate('./markdown-it-pdf.config.js');
    }
}
