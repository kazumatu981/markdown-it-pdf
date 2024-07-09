import { ConfigDefines } from './config-define-types';

export const DefaultConfigDefines: ConfigDefines = {
    server: {
        description: ['The options to configure the server.'],
        properties: {
            port: {
                description: ['The port to listen on'],
                type: 'number',
                value: 3000,
                isCommented: false,
            },
            retry: {
                type: 'number',
                value: 10,
                description: [
                    'The number of times to retry if the port is in use.',
                ],
                isCommented: true,
            },
            range: {
                description: ['The range of ports to search for.'],
                type: 'object',
                value: {
                    min: {
                        description: ['The minimum port to search for.'],
                        type: 'number',
                        value: 49152,
                    },
                    max: {
                        description: ['The maximum port to search for.'],
                        type: 'number',
                        value: 65535,
                    },
                },
                isCommented: true,
            },
        },
    },

    render: {
        description: ['The options to configure the Markdown renderer.'],
        properties: {
            externalUrls: {
                description: ['The external urls for styles'],
                type: 'string-array',
                value: [
                    'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.5.1/styles/github.min.css',
                ],
                isCommented: true,
            },
            templatePath: {
                description: ['The template html file path'],
                type: 'string',
                value: './template.html',
                isCommented: true,
            },
            hljs: {
                description: [
                    'The highlight.js config. if false, no highlight.js will be used.',
                ],
                type: 'object',
                value: {
                    js: {
                        description: ['The url to the js. like CDN server.'],
                        type: 'string',
                        value: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.5.1/highlight.min.js',
                    },
                    css: {
                        description: ['The url to the css. like CDN server.'],
                        type: 'string',
                        value: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.5.1/styles/github.min.css',
                    },
                },
            },
            recursive: {
                description: ['Whether to recursively search for files.'],
                type: 'boolean',
                value: true,
            },
        },
    },

    printer: {
        description: ['The options to configure the PDF printer.'],
        properties: {
            format: {
                description: ['The paper size of the PDF.'],
                type: 'string',
                value: 'A4',
            },
            margin: {
                description: ['The margin of the PDF.'],
                type: 'object',
                value: {
                    top: {
                        description: ['The top margin of the PDF.'],
                        type: 'string',
                        value: '12.7mm',
                    },
                    bottom: {
                        description: ['The bottom margin of the PDF.'],
                        type: 'string',
                        value: '12.7mm',
                    },
                    left: {
                        description: ['The left margin of the PDF.'],
                        type: 'string',
                        value: '12.7mm',
                    },
                    right: {
                        description: ['The right margin of the PDF.'],
                        type: 'string',
                        value: '12.7mm',
                    },
                },
            },
        },
    },
};
