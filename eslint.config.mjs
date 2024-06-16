import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import jsdoc from 'eslint-plugin-jsdoc';

export default [
    {
        languageOptions: { globals: globals.node },
    },
    jsdoc.configs['flat/recommended-typescript'],
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    // rules for code metrics
    {
        rules: {
            'max-lines-per-function': ['error', 300],
            'max-lines': ['error', 300],
            'max-len': ['error', { code: 120, ignoreComments: true }],
            'max-statements-per-line': ['error', { max: 1 }],
            'max-statements': ['error', 21],
            'max-nested-callbacks': ['error', 3],
            'max-params': ['error', 5],
            'max-depth': ['error', 3],
            complexity: ['error', 5],
        },
    },
    {
        files: ['**/*.ts'],
        plugins: {
            jsdoc,
        },
        rules: {
            'jsdoc/require-jsdoc': [
                'warn',
                {
                    publicOnly: true,
                    require: {
                        ArrowFunctionExpression: true,
                        ClassDeclaration: true,
                        ClassExpression: true,
                        FunctionDeclaration: true,
                        FunctionExpression: true,
                        MethodDefinition: true,
                    },
                    contexts: [
                        'VariableDeclaration',
                        'TSInterfaceDeclaration',
                        'TSTypeAliasDeclaration',
                        'TSPropertySignature',
                        'TSMethodSignature',
                    ],
                },
            ],
            'jsdoc/no-types': 'off',
            'jsdoc/check-line-alignment': 'error',
        },
    },
    {
        ignores: ['**/node_modules/**', '**/__tests__/**'],
    },
];
