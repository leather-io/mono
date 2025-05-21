import pluginQuery from '@tanstack/eslint-plugin-query';
import pluginLingui from 'eslint-plugin-lingui';
import tseslint from 'typescript-eslint';

import baseConfig from '@leather.io/eslint-config';
import reactConfig from '@leather.io/eslint-config/react';

export default tseslint.config(
  {
    files: ['{packages,apps}/**/*.{ts,tsx}'],
    extends: [baseConfig],
  },
  {
    files: ['**/*.spec.ts'],
    rules: {
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  },
  {
    ignores: [
      '**/*.{js,cjs,mjs}',
      '**/node_modules/',
      '**/leather-styles/',
      '**/dist/',
      '**/dist-web/',
      '**/dist-native/',
      '**/.expo/',
      '**/.turbo/',
      '**/.tsup/',
      '**/*.d.ts',
      '**/*.stories.{ts,tsx}',
      '**/tsup.config*.ts',
      '**/.react-router/',
      '**/.wrangler/',
    ],
  },
  {
    name: 'ui',
    files: ['packages/ui/src/**/*.{ts,tsx}'],
    extends: [reactConfig],
  },
  {
    name: 'query',
    files: ['packages/query/src/**/*.{ts,tsx}'],
    extends: [reactConfig, pluginQuery.configs['flat/recommended']],
  },
  {
    name: 'web',
    files: ['apps/web/app/**/*.{ts,tsx}'],
    extends: [reactConfig, pluginQuery.configs['flat/recommended']],
    rules: {
      '@typescript-eslint/only-throw-error': 'off',
      'no-duplicate-imports': 'off',
      '@typescript-eslint/no-duplicate-imports': ['error'],
      // Component and hook definition rules
      'react/function-component-definition': ['error', {
        'namedComponents': 'function-declaration',
        'unnamedComponents': 'arrow-function'
      }],
      // TypeScript rules
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/explicit-function-return-type': ['error', {
        'allowExpressions': true
      }],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      // Code quality
      'react/jsx-fragments': ['error', 'element'],
      'prefer-const': 'error',
      'eqeqeq': ['error', 'always', { 'null': 'ignore' }],
      // Import ordering
      'import/order': ['error', {
        'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'pathGroups': [
          {
            'pattern': 'react',
            'group': 'external',
            'position': 'before'
          },
          {
            'pattern': '@leather*',
            'group': 'external',
            'position': 'after'
          }
        ],
        'newlines-between': 'always',
        'alphabetize': {
          'order': 'asc',
          'caseInsensitive': true
        }
      }]
    },
  },
  {
    name: 'mobile',
    files: ['apps/mobile/src/**/*.{ts,tsx}'],
    extends: [reactConfig, pluginLingui.configs['flat/recommended']],
    rules: {
      'lingui/no-unlocalized-strings': [
        'error',
        {
          ignoreFunction: [
            'Error',
            'StacksError',
            'BitcoinError',
            'console.log',
            'console.warn',
            'console.error',
            'assertExistence',
            'it',
            'describe',
            'test',
          ],
          ignoreProperty: [
            'InvalidParams',
            'NullOrigin',
            'UndefinedParams',
            'UserRejectedOperation',
          ],
          ignoreAttribute: ['d'],
        },
      ],
    },
  },
  {
    name: 'test-files',
    files: ['**/*.spec.ts', '**/*.mocks.ts'],
    rules: {
      'lingui/no-unlocalized-strings': 'off',
    },
  }
);
