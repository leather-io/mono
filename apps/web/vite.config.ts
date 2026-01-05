import { cloudflare } from '@cloudflare/vite-plugin';
import { viteCommonjs } from '@originjs/vite-plugin-commonjs';
import pandacss from '@pandacss/dev/postcss';
import { reactRouter } from '@react-router/dev/vite';
import { type SentryReactRouterBuildOptions, sentryReactRouter } from '@sentry/react-router';
import path from 'node:path';
import { defineConfig } from 'vite';
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
    alias: {
      'leather-styles': path.resolve(__dirname, 'leather-styles'),
      axios: path.resolve(__dirname, 'node_modules/axios/dist/esm/axios.js'),
      'msw/node': path.resolve(__dirname, 'node_modules/msw/lib/node/index.js'),
      // Stub out @bitflowlabs/core-sdk for browser compatibility
      '@bitflowlabs/core-sdk': path.resolve(__dirname, 'stubs/bitflow-sdk-stub.js'),
    },
  },
  define: {
    // Required for some libs e.g. pbkdf2
    global: 'globalThis',
    'import.meta.env.CLOUDFLARE_ENV': JSON.stringify(process.env.CLOUDFLARE_ENV),
  },
  plugins: [
    copyMswWorker(),
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    svgr({ include: '**/*.svg' }),
    viteCommonjs(),
    reactRouter(),
    process.env.LEATHER_TARGET === 'production' &&
      sentryReactRouter(sentryConfig, { command, mode, isSsrBuild }),
    tsconfigPaths(),
  ],
  sentryConfig,
}));
