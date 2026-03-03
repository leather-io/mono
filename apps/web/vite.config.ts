import { cloudflare } from '@cloudflare/vite-plugin';
import { viteCommonjs } from '@originjs/vite-plugin-commonjs';
import pandacss from '@pandacss/dev/postcss';
import { reactRouter } from '@react-router/dev/vite';
import { type SentryReactRouterBuildOptions, sentryReactRouter } from '@sentry/react-router';
import path from 'node:path';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

import { copyMswWorker } from './scripts/copy-msw-worker.plugin';

const sentryConfig: SentryReactRouterBuildOptions = {
  org: 'trust-machines',
  project: 'leather-web',
  authToken: process.env.LEATHER_SENTRY_AUTH_TOKEN,
};

export default defineConfig(({ command, mode, isSsrBuild }) => ({
  envPrefix: 'LEATHER_',
  server: {
    host: true,
  },
  build: {
    target: 'es2022',
  },
  optimizeDeps: {
    exclude: ['axios'],
  },
  css: {
    postcss: {
      // Type error with Panda plugin
      plugins: [pandacss] as any[],
    },
  },
  resolve: {
    alias: [
      // Shim imports broken in polyfill package plugin. Can be removed in later
      // version and resolve.alias returned to object syntax
      // https://github.com/davidmyersdev/vite-plugin-node-polyfills/pull/141
      {
        find: /^(vite-plugin-node-polyfills\/shims\/.+)/,
        replacement: '$1',
        customResolver(source) {
          return import.meta.resolve(source).replace(/^file:\/\//, '');
        },
      },
      { find: '~', replacement: path.resolve(__dirname, 'app') },
      { find: 'leather-styles', replacement: path.resolve(__dirname, 'leather-styles') },
      {
        find: 'axios',
        replacement: path.resolve(__dirname, 'node_modules/axios/dist/esm/axios.js'),
      },
      {
        find: 'msw/node',
        replacement: path.resolve(__dirname, 'node_modules/msw/lib/node/index.js'),
      },
      {
        find: '@bitflowlabs/core-sdk',
        replacement: path.resolve(__dirname, 'stubs/bitflow-sdk-stub.js'),
      },
    ],
  },
  define: {
    // Required for some libs e.g. pbkdf2
    global: 'globalThis',
    'import.meta.env.CLOUDFLARE_ENV': JSON.stringify(process.env.CLOUDFLARE_ENV),
  },
  plugins: [
    nodePolyfills({
      include: ['process', 'util'],
      globals: {
        process: true,
      },
    }),
    copyMswWorker(),
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    svgr({ include: '**/*.svg' }),
    viteCommonjs(),
    reactRouter(),
    process.env.LEATHER_TARGET === 'production' &&
      sentryReactRouter(sentryConfig, { command, mode, isSsrBuild }),
    tsconfigPaths(),
    // Temporary hack to fix Cloudflare Workers issue with Vite plugin. To
    // remove when CI builds without it
    // https://github.com/cloudflare/workers-sdk/issues/8909#issuecomment-3401112596
    {
      name: 'cloudflare-vite-plugin-fix',
      configEnvironment(name, config) {
        const isDev = process.env.npm_lifecycle_script?.includes('react-router dev');
        if (name === 'ssr' && !isDev) {
          delete config.dev;
        }
      },
    },
  ],
  sentryConfig,
}));
