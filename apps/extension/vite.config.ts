import { crx } from '@crxjs/vite-plugin';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import react from '@vitejs/plugin-react';
import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sourcemaps from 'rollup-plugin-sourcemaps2';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig, loadEnv } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

import manifest, { getTargetBrowser, inpageBuildMatch } from './manifest.config';
import packageJson from './package.json' with { type: 'json' };
import { buildMetadata } from './tooling/build-metadata';
import {
  assertChunkSizes,
  assertServiceWorkerCompatibility,
  copyExtensionAssets,
  isolateServiceWorker,
  protectPageContextArtifacts,
} from './tooling/vite-plugins';

const extensionRoot = fileURLToPath(new URL('.', import.meta.url));
const firefoxChunkSizeLimit = 3_500_000;
const firefoxDependencySplitThreshold = 250_000;
const firefoxDependencyGroups = new Map([
  ['@bitcoinerlab/descriptors', 'bitcoin-descriptors'],
  ['@bitcoinerlab/descriptors-core', 'bitcoin-descriptors'],
  ['@ledgerhq/ledger-bitcoin', 'bitcoin-descriptors'],
  ['bitcoinjs-lib', 'bitcoin-descriptors'],
  ['brorand', 'crypto-browserify'],
  ['browserify-sign', 'crypto-browserify'],
  ['crypto-browserify', 'crypto-browserify'],
  ['elliptic', 'crypto-browserify'],
]);
const dependencyJavaScriptSizes = new Map<string, number>();
const backgroundEntry = path.join(extensionRoot, 'src/background/background.ts');
const dependencySourceMapPatterns = [
  '**/node_modules/@leather.io/**/*.{js,mjs,cjs}',
  '**/node_modules/@stacks/**/*.{js,mjs,cjs}',
  '**/packages/*/dist*/**/*.{js,mjs,cjs}',
];
const extensionAliases = {
  '@stacks/auth': '@stacks/auth/dist/esm',
  '@stacks/common': '@stacks/common/dist/esm',
  '@stacks/encryption': '@stacks/encryption/dist/esm',
  '@stacks/network': '@stacks/network/dist/esm',
  '@stacks/transactions/dist/cl': '@stacks/transactions/dist/esm/cl',
  '@stacks/transactions': '@stacks/transactions/dist/esm',
  '@stacks/wallet-sdk': '@stacks/wallet-sdk/dist/esm',
  '@app': path.resolve(extensionRoot, 'src/app'),
  '@assets': path.resolve(extensionRoot, 'public/assets'),
  '@background': path.resolve(extensionRoot, 'src/background'),
  '@content-scripts': path.resolve(extensionRoot, 'src/content-scripts'),
  '@inpage': path.resolve(extensionRoot, 'src/inpage'),
  '@shared': path.resolve(extensionRoot, 'src/shared'),
  '@tests': path.resolve(extensionRoot, 'tests'),
  'leather-styles': path.resolve(extensionRoot, 'leather-styles'),
  'lottie-web': path.resolve(extensionRoot, 'node_modules/lottie-web/build/player/lottie_light.js'),
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
};
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
    COMMIT_SHA: process.env.COMMIT_SHA || buildMetadata.commitSha,
  };
  return Object.fromEntries(
    runtimeEnvironmentKeys.map(key => {
      const value = environment[key];
      return [`process.env.${key}`, value === undefined ? 'undefined' : JSON.stringify(value)];
    })
  );
}

function getSharedPlugins() {
  return [
    tsconfigPaths(),
    sourcemaps({ include: dependencySourceMapPatterns }),
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
  ];
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

function getDependencyRoot(id: string) {
  const normalizedId = id.replaceAll('\0', '');
  const nodeModulesMarker = '/node_modules/';
  const markerIndex = normalizedId.lastIndexOf(nodeModulesMarker);
  if (markerIndex === -1) return undefined;
  const dependencyPath = normalizedId.slice(markerIndex + nodeModulesMarker.length);
  const [scopeOrName, packageName] = dependencyPath.split('/');
  if (!scopeOrName) return undefined;
  const nodeModulesPath = normalizedId.slice(0, markerIndex + nodeModulesMarker.length);
  if (!scopeOrName.startsWith('@')) return path.join(nodeModulesPath, scopeOrName);
  if (!packageName) return undefined;
  return path.join(nodeModulesPath, scopeOrName, packageName);
}

function getDirectoryJavaScriptSize(directory: string): number {
  return readdirSync(directory, { withFileTypes: true }).reduce((size, entry) => {
    if (entry.name === 'node_modules') return size;
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return size + getDirectoryJavaScriptSize(filePath);
    if (!/\.(c|m)?js$/.test(entry.name)) return size;
    return size + statSync(filePath).size;
  }, 0);
}

function shouldSplitFirefoxDependency(id: string, dependencyName: string) {
  if (firefoxDependencyGroups.has(dependencyName)) return true;
  const dependencyRoot = getDependencyRoot(id);
  if (!dependencyRoot) return false;
  const cachedSize = dependencyJavaScriptSizes.get(dependencyRoot);
  if (cachedSize !== undefined) return cachedSize >= firefoxDependencySplitThreshold;
  const dependencySize = getDirectoryJavaScriptSize(dependencyRoot);
  dependencyJavaScriptSizes.set(dependencyRoot, dependencySize);
  return dependencySize >= firefoxDependencySplitThreshold;
}

function sanitizeChunkName(name: string) {
  return name.replace(/[^a-zA-Z0-9-]/g, '-');
}

function getFirefoxVendorChunkName(dependencyName: string) {
  const dependencyGroup = firefoxDependencyGroups.get(dependencyName);
  if (dependencyGroup) return `vendor-${dependencyGroup}`;
  return `vendor-${sanitizeChunkName(dependencyName)}`;
}

function getManualChunkName(id: string, targetBrowser: 'chromium' | 'firefox') {
  const dependencyName = getDependencyName(id);
  if (targetBrowser !== 'firefox') {
    if (dependencyName !== '@stacks/transactions') return;
    return `vendor-${sanitizeChunkName(dependencyName)}`;
  }
  if (dependencyName && shouldSplitFirefoxDependency(id, dependencyName)) {
    return getFirefoxVendorChunkName(dependencyName);
  }
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
  const environmentDefinitions = getRuntimeEnvironmentDefinitions(mode);
  const sourceMap = mode === 'development' ? 'inline' : 'hidden';

  return {
    root: extensionRoot,
    publicDir: false,
    base: '/',
    define: {
      ...environmentDefinitions,
      VERSION: JSON.stringify(buildMetadata.version),
    },
    resolve: {
      alias: extensionAliases,
      dedupe: ['react', 'react-dom'],
    },
    plugins: [
      ...getSharedPlugins(),
      crx({
        manifest,
        browser: targetBrowser === 'firefox' ? 'firefox' : 'chrome',
        contentScripts: {
          standaloneFiles: ['content-script.ts', 'inpage.ts'],
        },
        liveReload: targetBrowser !== 'firefox',
      }),
      isolateServiceWorker({
        backgroundEntry,
        targetBrowser,
        config: {
          root: extensionRoot,
          mode,
          publicDir: false,
          base: '/',
          define: {
            ...environmentDefinitions,
            VERSION: JSON.stringify(buildMetadata.version),
          },
          resolve: {
            alias: extensionAliases,
            dedupe: ['react', 'react-dom'],
          },
          plugins: getSharedPlugins(),
          build: {
            target: 'es2022',
            minify: mode === 'production' ? 'esbuild' : false,
            sourcemap: sourceMap,
          },
        },
      }),
      copyExtensionAssets(extensionRoot),
      protectPageContextArtifacts(inpageBuildMatch),
      ...(targetBrowser === 'chromium' ? [assertServiceWorkerCompatibility(backgroundEntry)] : []),
      ...(targetBrowser === 'firefox'
        ? [
            assertChunkSizes(
              firefoxChunkSizeLimit,
              'Lower firefoxDependencySplitThreshold to split more dependencies automatically'
            ),
          ]
        : []),
      ...(analyzeBundle
        ? [
            visualizer({
              filename: path.join(extensionRoot, 'bundle-analysis.html'),
              open: false,
            }),
          ]
        : []),
      ...(mode !== 'development' && process.env.EXTENSION_WATCH_BUILD !== 'true' && sentryAuthToken
        ? [
            sentryVitePlugin({
              authToken: sentryAuthToken,
              org: 'trust-machines',
              project: 'leather',
              release: {
                inject: false,
                name: packageJson.version,
                uploadLegacySourcemaps: './dist',
              },
              sourcemaps: {
                disable: true,
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
      sourcemap: sourceMap,
      rollupOptions: {
        input: {
          index: path.join(extensionRoot, 'index.html'),
          popup: path.join(extensionRoot, 'popup.html'),
          actionPopup: path.join(extensionRoot, 'action-popup.html'),
          debug: path.join(extensionRoot, 'debug.html'),
        },
        output: {
          hoistTransitiveImports: false,
          manualChunks(id) {
            return getManualChunkName(id, targetBrowser);
          },
        },
      },
    },
  };
});
