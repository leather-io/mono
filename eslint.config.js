import pluginQuery from '@tanstack/eslint-plugin-query';
import pluginLingui from 'eslint-plugin-lingui';
import pluginReactCompiler from 'eslint-plugin-react-compiler';
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
              name: 'track',
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
  },
  {
    name: 'mobile',
    files: ['apps/mobile/src/**/*.{ts,tsx}'],
    extends: [reactConfig, pluginLingui.configs['flat/recommended']],
    plugins: {
      'react-compiler': pluginReactCompiler,
    },
    rules: {
      ...pluginReactCompiler.configs.recommended.rules,
      'react-hooks/exhaustive-deps': 'off',
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
