import js from '@eslint/js';
import perfectionist from 'eslint-plugin-perfectionist';
import reactHooks from 'eslint-plugin-react-hooks';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores(['dist/', 'locales/', 'node_modules/', 'storybook-static/']),
  js.configs.recommended,
  tseslint.configs.recommended,
  //React Compiler rules at "warn": MRT's internals opt out with 'use no memo' (see src/index.ts), the
  //warning count is the burn-down metric for compiling the library itself
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    rules: Object.fromEntries(
      Object.keys(reactHooks.configs.flat.recommended.rules).map((rule) => [
        rule,
        'warn',
      ]),
    ),
  },
  {
    files: ['**/*.cjs'],
    languageOptions: { sourceType: 'commonjs' },
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx}'],
    plugins: { perfectionist },
    rules: {
      'no-duplicate-imports': 'warn',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: true,
          fixStyle: 'inline-type-imports',
        },
      ],
      'perfectionist/sort-named-imports': [
        'warn',
        { type: 'natural', order: 'asc' },
      ],
      'perfectionist/sort-imports': [
        'warn',
        {
          type: 'natural',
          order: 'asc',
          groups: [
            'clsx',
            'style',
            'react',
            'tanstack',
            'mantine',
            'mrt',
            ['sibling', 'type-sibling', 'parent', 'type-parent'],
            'unknown',
          ],
          customGroups: [
            { groupName: 'clsx', elementNamePattern: '^clsx$' },
            {
              groupName: 'style',
              elementNamePattern: '^\\./[^/]*\\.module\\.css$',
            },
            {
              groupName: 'react',
              elementNamePattern: ['^react$', '^react-.+'],
            },
            { groupName: 'tanstack', elementNamePattern: '^@tanstack/' },
            { groupName: 'mantine', elementNamePattern: '^@mantine/' },
            {
              groupName: 'mrt',
              elementNamePattern: [
                '^\\./MRT_[^/]*$',
                '^\\.\\./[^/]*MRT_[^/]*$',
                '^\\.\\./\\.\\./src$',
              ],
            },
          ],
        },
      ],
    },
  },
]);
