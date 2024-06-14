import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';

// TODO Add eslint-plugin-jsdoc

export default [
    {
        languageOptions: { globals: globals.node },
    },

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
            complexity: ['error', 10],
        },
    },
    {
        ignores: ['**/node_modules/**', '**/__tests__/**'],
    },
];
