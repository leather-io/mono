import pluginQuery from '@tanstack/eslint-plugin-query';
import pluginLingui from 'eslint-plugin-lingui';
import tseslint from 'typescript-eslint';

import baseConfig from '@leather.io/eslint-config';
import reactConfig from '@leather.io/eslint-config/react';

export default tseslint.config(
  {
    files: ['{packages,apps}/**/*.{ts,tsx}'],
    extends: [baseConfig],
    rules: {
      '@typescript-eslint/no-floating-promises': [
        'error',
        {
          allowForKnownSafeCalls: [
            {
              from: 'package',
              package: '@leather.io/analytics',
              name: ['track', 'untypedTrack'],
            },
          ],
        },
      ],
    },
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
      '**/generated/',
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
    name: 'cms',
    files: ['packages/cms/src/**/*.{ts,tsx}'],
  },
  {
    name: 'web',
    files: ['apps/web/app/**/*.{ts,tsx}'],
    extends: [reactConfig, pluginQuery.configs['flat/recommended']],
  },
  {
    name: 'mobile',
    files: ['apps/mobile/src/**/*.{ts,tsx}'],
    extends: [reactConfig, pluginLingui.configs['flat/recommended']],
    rules: {
      'lingui/no-unlocalized-strings': [
        'error',
        // https://github.com/lingui/eslint-plugin/blob/main/docs/rules/no-unlocalized-strings.md
        {
          ignore: ['^(?![A-Z])\\S+$', '^[A-Z0-9_-]+$'],
          ignoreNames: [
            { regex: { pattern: 'className', flags: 'i' } },
            { regex: { pattern: '^[A-Z0-9_-]+$' } },
            'styleName',
            'src',
            'srcSet',
            'type',
            'id',
            'width',
            'height',
            'displayName',
            'Authorization',
          ],
          ignoreFunctions: [
            'Error',
            'BitcoinError',
            'captureException',
            'captureMessage',
            'console.log',
            'console.warn',
            'console.error',
            'it',
            'describe',
            'test',
            'assertExistence',
            'cva',
            'cn',
            'track',
            'Error',
            'console.*',
            '*headers.set',
            '*.addEventListener',
            '*.removeEventListener',
            '*.postMessage',
            '*.getElementById',
            '*.dispatch',
            '*.commit',
            '*.includes',
            '*.indexOf',
            '*.endsWith',
            '*.format',
            '*.startsWith',
            'require',
          ],
          // Following settings require typed linting https://typescript-eslint.io/getting-started/typed-linting/
          useTsTypes: true,
          ignoreMethodsOnTypes: [
            // Ignore specified methods on Map and Set types
            'Map.get',
            'Map.has',
            'Set.has',
          ],
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
