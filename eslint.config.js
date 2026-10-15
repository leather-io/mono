import pluginQuery from '@tanstack/eslint-plugin-query';
import pluginLingui from 'eslint-plugin-lingui';
import { defineConfig } from 'eslint/config';

import baseConfig, {
  sharedRestrictedImportPaths,
  sharedRestrictedSyntax,
} from '@leather.io/eslint-config';
import reactConfig from '@leather.io/eslint-config/react';
import { noDimensionsScreenRule } from '@leather.io/eslint-config/rules/no-dimensions-screen';
import { noSamePackageBarrelImportRule } from '@leather.io/eslint-config/rules/no-same-package-barrel-import';

const useQueryConfigOrKeyRule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Ensure useQuery object arguments either spread a query config builder or explicitly specify both queryKey and queryFn.',
    },
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node) {
        if (node.callee.type !== 'Identifier' || node.callee.name !== 'useQuery') return;
        const arg = node.arguments[0];
        if (!arg || arg.type !== 'ObjectExpression') return;

        const hasSpread = arg.properties.some(prop => prop.type === 'SpreadElement');
        if (hasSpread) return;

        const hasQueryKey = arg.properties.some(prop => {
          if (prop.type !== 'Property' || prop.computed) return false;
          const key = prop.key;
          return (
            (key.type === 'Identifier' && key.name === 'queryKey') ||
            (key.type === 'Literal' && key.value === 'queryKey')
          );
        });

        const hasQueryFn = arg.properties.some(prop => {
          if (prop.type !== 'Property' || prop.computed) return false;
          const key = prop.key;
          return (
            (key.type === 'Identifier' && key.name === 'queryFn') ||
            (key.type === 'Literal' && key.value === 'queryFn')
          );
        });

        if (!hasQueryKey || !hasQueryFn) {
          context.report({
            node: arg,
            message:
              'useQuery object argument should either spread a query config (e.g. createXQueryConfig(...)) or explicitly define both queryKey and queryFn.',
          });
        }
      },
    };
  },
};

const leatherCustomPlugin = {
  rules: {
    'use-query-config-or-key': useQueryConfigOrKeyRule,
  },
};

const leatherPlugin = {
  rules: {
    'no-dimensions-screen': noDimensionsScreenRule,
    'no-same-package-barrel-import': noSamePackageBarrelImportRule,
  },
};

function remedaMessage(native, remeda) {
  return `Use ${remeda} from remeda instead of ${native} in library code for typed results.`;
}

const reactRouterLocationStateSyntax = {
  selector:
    'MemberExpression[object.name="location"][property.name="state"], VariableDeclarator[init.callee.name="useLocation"] > ObjectPattern > Property[key.name="state"]',
  message: 'location.state is any. Read route state through useRouteState(schema).',
};

export default defineConfig([
  {
    files: ['{packages,apps}/**/*.{ts,tsx}'],
    extends: [baseConfig],
    plugins: {
      'leather.io': leatherPlugin,
    },
    rules: {
      'leather.io/no-same-package-barrel-import': 'error',
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
      '**/.tsdown/',
      '**/*.d.ts',
      '**/tsdown.config*.ts',
      '**/panda.config*.ts',
      '**/app.config*.ts',
      '**/lingui.config*.ts',
      '**/sanity.config*.ts',
      '**/react-router.config*.ts',
      '**/playwright.config*.ts',
      '**/sanity.cli.ts',
      '**/scripts/',
      '**/.react-router/',
      '**/.wrangler/',
      '**/generated/',
      'packages/ui/src/icons/docs',
    ],
  },
  {
    name: 'ui',
    files: ['packages/ui/src/**/*.{ts,tsx}'],
    extends: [reactConfig],
  },
  {
    name: 'isolated declarations packages',
    files: ['packages/constants/src/**/*.{ts,tsx}', 'packages/test-config/src/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-inferrable-types': 'off',
    },
  },
  {
    name: 'query',
    files: ['packages/query/src/**/*.{ts,tsx}'],
    extends: [reactConfig, pluginQuery.configs['flat/recommended']],
  },
  {
    name: 'queries-package',
    files: ['packages/queries/src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            ...sharedRestrictedImportPaths,
            {
              name: '@tanstack/react-query',
              importNames: [
                'useQuery',
                'useInfiniteQuery',
                'useSuspenseQuery',
                'useSuspenseInfiniteQuery',
                'useQueries',
                'useMutation',
                'useQueryClient',
              ],
              message:
                'Do not import React Query hooks in @leather.io/queries. Export pure query config builders instead.',
            },
          ],
        },
      ],
      'id-match': [
        'error',
        '^(?!use[A-Z]).*$',
        {
          onlyDeclarations: true,
          properties: false,
          ignoreDestructuring: true,
        },
      ],
      'no-restricted-syntax': [
        'error',
        ...sharedRestrictedSyntax,
        {
          selector: 'TSTypeAliasDeclaration[id.name=/QueryOptions$/]',
          message:
            'Do not define *QueryOptions type aliases in @leather.io/queries. Consumers should use UseQueryOptions in app code instead of wrapper types.',
        },
      ],
    },
  },
  {
    name: 'cms',
    files: ['packages/cms/src/**/*.{ts,tsx}'],
  },
  {
    name: 'web',
    files: ['apps/web/app/**/*.{ts,tsx}'],
    extends: [reactConfig, pluginQuery.configs['flat/recommended']],
    rules: {
      '@typescript-eslint/only-throw-error': 'off',
    },
  },
  {
    name: 'extension',
    files: ['apps/extension/src/**/*.{ts,tsx}'],
    extends: [reactConfig, pluginQuery.configs['flat/recommended']],
  },
  {
    name: 'react-router-apps',
    files: ['apps/extension/**/*.{ts,tsx}', 'apps/web/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': ['error', ...sharedRestrictedSyntax, reactRouterLocationStateSyntax],
    },
  },
  {
    name: 'mobile',
    files: ['apps/mobile/src/**/*.{ts,tsx}'],
    extends: [reactConfig, pluginLingui.configs['flat/recommended']],
    rules: {
      'leather.io/no-dimensions-screen': 'error',
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
            'fontFamily',
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
  },
  {
    name: 'library-packages-prefer-remeda',
    files: ['packages/**/src/**/*.{ts,tsx}'],
    ignores: ['**/*.spec.{ts,tsx}'],
    rules: {
      'no-restricted-properties': [
        'error',
        { object: 'Object', property: 'keys', message: remedaMessage('Object.keys', 'keys()') },
        {
          object: 'Object',
          property: 'entries',
          message: remedaMessage('Object.entries', 'entries()'),
        },
        {
          object: 'Object',
          property: 'values',
          message: remedaMessage('Object.values', 'values()'),
        },
        {
          object: 'Object',
          property: 'fromEntries',
          message: remedaMessage('Object.fromEntries', 'fromEntries()'),
        },
      ],
    },
  },
  {
    name: 'app-query-service-usage',
    files: ['apps/mobile/src/queries/**/*.{ts,tsx}', 'apps/web/app/queries/**/*.{ts,tsx}'],
    plugins: {
      leather: leatherCustomPlugin,
    },
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            ...sharedRestrictedImportPaths,
            {
              name: '@leather.io/services',
              importNames: [
                'getAccountBalancesService',
                'getActivityService',
                'getAssetListService',
                'getBitcoinStakingService',
                'getBitcoinTransactionFeesService',
                'getBitcoinTransactionsService',
                'getBlockchainActivityService',
                'getBnsService',
                'getBtcBalancesService',
                'getCollectiblesService',
                'getComplianceService',
                'getFungibleAssetInfoService',
                'getMarketDataService',
                'getMarketHistoryService',
                'getMarketStatsService',
                'getMultisigService',
                'getSip10AssetService',
                'getSip10BalancesService',
                'getStacksTransactionFeesService',
                'getStacksTransactionsService',
                'getStxBalancesService',
                'getTokenAnalyticsService',
                'getUtxosService',
              ],
              message:
                'In query modules, use @leather.io/queries builders instead of importing get*Service directly.',
            },
          ],
        },
      ],
      'leather/use-query-config-or-key': 'error',
    },
  },
]);
