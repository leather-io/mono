import { crx } from '@crxjs/vite-plugin';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig, loadEnv } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

import { buildMetadata } from './build/build-metadata';
import {
  assertChunkSizes,
  copyExtensionAssets,
  excludePageContextSourceMaps,
} from './build/vite-plugins';
import manifest, { getTargetBrowser } from './manifest.config';
import packageJson from './package.json' with { type: 'json' };

const extensionRoot = fileURLToPath(new URL('.', import.meta.url));
const firefoxChunkSizeLimit = 3_500_000;
const bitcoinDescriptorDependencies = new Set([
  '@bitcoinerlab/descriptors',
  '@bitcoinerlab/descriptors-core',
  '@ledgerhq/ledger-bitcoin',
  'bitcoinjs-lib',
]);
const firefoxSplitDependencies = new Set([
  '@stacks/transactions',
  'alex-sdk',
  'bn.js',
  'framer-motion',
  'lottie-web',
  'mixpanel-browser',
  'react-dom',
  'react-router',
  'valibot',
  'zod',
  'zxcvbn',
]);
const runtimeEnvironmentKeys = [
  'BITFLOW_API_HOST',
  'BITFLOW_API_KEY',
  'BITFLOW_KEEPER_API_HOST',
  'BITFLOW_KEEPER_API_KEY',
  'BITFLOW_PROVIDER_ADDRESS',
  'BRANCH_NAME',
  'COMMIT_SHA',
  'DEBUG_PREVENT_WINDOW_CLOSE',
  'DEBUG_TX_MONITOR',
  'GITHUB_REF',
  'LAUNCH_DARKLY_KEY',
  'MIXPANEL_TOKEN',
  'MULTISIG_API_URL',
  'ONRAMPER_API_KEY',
  'ONRAMPER_SIGNING_SECRET',
  'ONRAMPER_WIDGET_HOST',
  'PR_NUMBER',
  'REACT_QUERY_DEVTOOLS_ENABLED',
  'SENTRY_DSN',
  'TEST_ENV',
  'WALLET_ENVIRONMENT',
];

function getRuntimeEnvironmentDefinitions(mode: string) {
  const environment: Record<string, string | undefined> = {
    ...loadEnv(mode, extensionRoot, ''),
    ...process.env,
    BRANCH_NAME: buildMetadata.branchName,
    COMMIT_SHA: process.env.COMMIT_SHA ?? buildMetadata.commitSha,
  };
  return Object.fromEntries(
    runtimeEnvironmentKeys.map(key => {
      const value = environment[key];
      return [`process.env.${key}`, value === undefined ? 'undefined' : JSON.stringify(value)];
    })
  );
}

function getDependencyName(id: string) {
  const nodeModulesMarker = '/node_modules/';
  const markerIndex = id.lastIndexOf(nodeModulesMarker);
  if (markerIndex === -1) return undefined;
  const dependencyPath = id.slice(markerIndex + nodeModulesMarker.length);
  const [scopeOrName, packageName] = dependencyPath.split('/');
  if (!scopeOrName) return undefined;
  if (scopeOrName.startsWith('@') && packageName) return `${scopeOrName}/${packageName}`;
  return scopeOrName;
}

function sanitizeChunkName(name: string) {
  return name.replace(/[^a-zA-Z0-9-]/g, '-');
}

function getFirefoxVendorChunkName(dependencyName: string) {
  if (bitcoinDescriptorDependencies.has(dependencyName)) return 'vendor-bitcoin-descriptors';
  if (dependencyName.startsWith('@noble/')) return 'vendor-noble';
  if (dependencyName.startsWith('@scure/')) return 'vendor-scure';
  if (!firefoxSplitDependencies.has(dependencyName)) return;
  return `vendor-${sanitizeChunkName(dependencyName)}`;
}

function getManualChunkName(id: string, targetBrowser: 'chromium' | 'firefox') {
  const dependencyName = getDependencyName(id);
  if (dependencyName) {
    if (targetBrowser !== 'firefox' && dependencyName !== '@stacks/transactions') return;
    if (targetBrowser === 'firefox') return getFirefoxVendorChunkName(dependencyName);
    return `vendor-${sanitizeChunkName(dependencyName)}`;
  }
  if (targetBrowser !== 'firefox') return;
  const packagesMarker = '/packages/';
  const packagesIndex = id.indexOf(packagesMarker);
  if (packagesIndex === -1) return;
  const packageName = id.slice(packagesIndex + packagesMarker.length).split('/')[0];
  if (!packageName) return;
  return `leather-${sanitizeChunkName(packageName)}`;
}

export default defineConfig(({ mode }) => {
  const targetBrowser = getTargetBrowser(process.env.TARGET_BROWSER);
  const analyzeBundle = process.env.ANALYZE === 'true';
  const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN;

  return {
    root: extensionRoot,
    publicDir: false,
    base: '/',
    define: {
      ...getRuntimeEnvironmentDefinitions(mode),
      VERSION: JSON.stringify(buildMetadata.version),
    },
    resolve: {
      alias: {
        '@app': path.resolve(extensionRoot, 'src/app'),
        '@assets': path.resolve(extensionRoot, 'public/assets'),
        '@background': path.resolve(extensionRoot, 'src/background'),
        '@content-scripts': path.resolve(extensionRoot, 'src/content-scripts'),
        '@inpage': path.resolve(extensionRoot, 'src/inpage'),
        '@shared': path.resolve(extensionRoot, 'src/shared'),
        '@tests': path.resolve(extensionRoot, 'tests'),
        'leather-styles': path.resolve(extensionRoot, 'leather-styles'),
        'lottie-web': path.resolve(
          extensionRoot,
          'node_modules/lottie-web/build/player/lottie_light.js'
        ),
        'vite-plugin-node-polyfills/shims/buffer': path.resolve(
          extensionRoot,
          'node_modules/vite-plugin-node-polyfills/shims/buffer/dist/index.js'
        ),
        'vite-plugin-node-polyfills/shims/global': path.resolve(
          extensionRoot,
          'node_modules/vite-plugin-node-polyfills/shims/global/dist/index.js'
        ),
        'vite-plugin-node-polyfills/shims/process': path.resolve(
          extensionRoot,
          'node_modules/vite-plugin-node-polyfills/shims/process/dist/index.js'
        ),
      },
      dedupe: ['react', 'react-dom'],
    },
    plugins: [
      tsconfigPaths(),
      react(),
      svgr(),
      nodePolyfills({
        globals: {
          Buffer: true,
          global: true,
          process: true,
        },
        overrides: {
          fs: 'browserify-fs',
        },
      }),
      crx({
        manifest,
        browser: targetBrowser === 'firefox' ? 'firefox' : 'chrome',
        liveReload: targetBrowser !== 'firefox',
      }),
      copyExtensionAssets(extensionRoot),
      excludePageContextSourceMaps(extensionRoot),
      ...(targetBrowser === 'firefox' ? [assertChunkSizes(firefoxChunkSizeLimit)] : []),
      ...(analyzeBundle
        ? [
            visualizer({
              filename: path.join(extensionRoot, 'bundle-analysis.html'),
              open: false,
            }),
          ]
        : []),
      ...(mode !== 'development' && sentryAuthToken
        ? [
            sentryVitePlugin({
              authToken: sentryAuthToken,
              org: 'trust-machines',
              project: 'leather',
              release: {
                name: packageJson.version,
              },
              sourcemaps: {
                assets: './dist/**',
              },
            }),
          ]
        : []),
    ],
    build: {
      outDir: path.join(extensionRoot, 'dist'),
      emptyOutDir: true,
      target: 'es2022',
      minify: false,
      sourcemap: mode === 'development' ? 'inline' : 'hidden',
      rollupOptions: {
        input: {
          index: path.join(extensionRoot, 'index.html'),
          popup: path.join(extensionRoot, 'popup.html'),
          actionPopup: path.join(extensionRoot, 'action-popup.html'),
          debug: path.join(extensionRoot, 'debug.html'),
        },
        output: {
          manualChunks(id) {
            return getManualChunkName(id, targetBrowser);
          },
        },
      },
    },
  };
});
