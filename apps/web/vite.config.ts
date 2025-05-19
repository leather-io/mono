import { cloudflare } from '@cloudflare/vite-plugin';
import { viteCommonjs } from '@originjs/vite-plugin-commonjs';
import pandacss from '@pandacss/dev/postcss';
import { reactRouter } from '@react-router/dev/vite';
import { type SentryReactRouterBuildOptions, sentryReactRouter } from '@sentry/react-router';
import path from 'node:path';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

const sentryConfig: SentryReactRouterBuildOptions = {
  org: 'trust-machines',
  project: 'leather-web',
  authToken: process.env.LEATHER_SENTRY_AUTH_TOKEN,
};

export default defineConfig(({ command, mode, isSsrBuild }) => ({
  envPrefix: 'LEATHER_',
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
    },
  },
  define: {
    // required for some libs (e.g. pbkdf2)
    global: 'globalThis',
  },
  plugins: [
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    svgr({ include: '**/*.svg' }),
    viteCommonjs(),
    reactRouter(),
    sentryReactRouter(sentryConfig, { command, mode, isSsrBuild }),
    tsconfigPaths(),
  ],
  sentryConfig,
}));
