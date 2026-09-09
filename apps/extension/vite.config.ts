import { crx } from '@crxjs/vite-plugin';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sourcemaps from 'rollup-plugin-sourcemaps2';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig, loadEnv } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

import manifest, { inpageBuildMatch } from './manifest.config';
import packageJson from './package.json' with { type: 'json' };
import { buildMetadata } from './tooling/build-metadata';
import {
  assertServiceWorkerCompatibility,
  buildInpageScript,
  copyExtensionAssets,
  polyfillProcessBeforeViteEnv,
  protectPageContextArtifacts,
  reactWithExternalRefreshPreamble,
} from './tooling/vite-plugins';

const extensionRoot = fileURLToPath(new URL('.', import.meta.url));
const backgroundEntry = path.join(extensionRoot, 'src/background/background.ts');
const inpageEntry = path.join(extensionRoot, 'inpage.ts');
const devServerPort = 8080;
const processShimSpecifier = 'vite-plugin-node-polyfills/shims/process';
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
    ...reactWithExternalRefreshPreamble(),
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

function sanitizeChunkName(name: string) {
  return name.replace(/[^a-zA-Z0-9-]/g, '-');
}

function getManualChunkName(id: string) {
  const dependencyName = getDependencyName(id);
  if (dependencyName !== '@stacks/transactions') return;
  return `vendor-${sanitizeChunkName(dependencyName)}`;
}

export default defineConfig(({ mode, command }) => {
  const analyzeBundle = process.env.ANALYZE === 'true';
  const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN;
  const environmentDefinitions = getRuntimeEnvironmentDefinitions(mode);
  const sourceMap = mode === 'development' ? true : 'hidden';

  return {
    root: extensionRoot,
    publicDir: command === 'serve' ? path.join(extensionRoot, 'public') : false,
    base: '/',
    server: {
      host: 'localhost',
      port: devServerPort,
      strictPort: true,
      hmr: {
        clientPort: devServerPort,
      },
    },
    define: {
      ...environmentDefinitions,
      VERSION: JSON.stringify(buildMetadata.version),
    },
    resolve: {
      alias: extensionAliases,
      dedupe: ['react', 'react-dom'],
    },
    plugins: [
      polyfillProcessBeforeViteEnv(processShimSpecifier),
      ...getSharedPlugins(),
      crx({
        manifest,
        browser: 'chrome',
        contentScripts: {
          standaloneFiles: ['content-script.ts', 'inpage.ts'],
        },
      }),
      copyExtensionAssets(extensionRoot),
      buildInpageScript(inpageEntry),
      protectPageContextArtifacts(inpageBuildMatch),
      assertServiceWorkerCompatibility(backgroundEntry),
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
      reportCompressedSize: false,
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
            return getManualChunkName(id);
          },
        },
      },
    },
  };
});
