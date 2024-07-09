import { CategorizedConfigDefines } from './config-define';

export const DefaultConfigDefines: CategorizedConfigDefines = {
    server: {
        description: 'The options to configure the server.',
        configDefine: {
            port: {
                description: 'The port to listen on',
                type: 'number',
                defaultValue: 3000,
            },
            retry: {
                description:
                    'The number of times to retry if the port is in use.',
                type: 'number',
                sampleValue: 10,
            },
            range: {
                description: 'The range of ports to search for.',
                type: 'object',
                defaultValue: {
                    min: {
                        description: 'The minimum port to search for.',
                        type: 'number',
                        sampleValue: 49152,
                    },
                    max: {
                        description: 'The maximum port to search for.',
                        type: 'number',
                        sampleValue: 65535,
                    },
                },
            },
        },
    },

    render: {
        description: 'The options to configure the Markdown renderer.',
        configDefine: {
            externalUrls: {
                description: 'The external urls for styles',
                type: 'string-array',
                sampleValue: [
                    'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.5.1/styles/github.min.css',
                ],
            },
            templatePath: {
                description: 'The template html file path',
                type: 'string',
                sampleValue: './template.html',
            },
            hljs: {
                description:
                    'The highlight.js config. if false, no highlight.js will be used.',
                type: 'object',
                defaultValue: {
                    js: {
                        description: 'The url to the js. like CDN server.',
                        type: 'string',
                        sampleValue:
                            'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.5.1/highlight.min.js',
                    },
                    css: {
                        description: 'The url to the css. like CDN server.',
                        type: 'string',
                        sampleValue:
                            'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.5.1/styles/github.min.css',
                    },
                },
            },
            recursive: {
                description: 'Whether to recursively search for files.',
                type: 'boolean',
                defaultValue: true,
            },
        },
    },

    printer: {
        description: 'The options to configure the PDF printer.',
        configDefine: {
            format: {
                description: 'The paper size of the PDF.',
                type: 'string',
                defaultValue: 'A4',
            },
            margin: {
                description: 'The margin of the PDF.',
                type: 'object',
                defaultValue: {
                    top: {
                        description: 'The top margin of the PDF.',
                        type: 'string',
                        defaultValue: '12.7mm',
                    },
                    bottom: {
                        description: 'The bottom margin of the PDF.',
                        type: 'string',
                        defaultValue: '12.7mm',
                    },
                    left: {
                        description: 'The left margin of the PDF.',
                        type: 'string',
                        defaultValue: '12.7mm',
                    },
                    right: {
                        description: 'The right margin of the PDF.',
                        type: 'string',
                        defaultValue: '12.7mm',
                    },
                },
            },
        },
    },
};
