import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    // @leather.io/bitcoin reaches bitcoinjs-lib, which expects Node globals.
    nodePolyfills({ include: ['process', 'util'], globals: { process: true } }),
    react(),
  ],
  define: {
    // Required for some libs e.g. pbkdf2
    global: 'globalThis',
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
    ],
  },
  server: {
    // Port 3000 is what apps/extension/playwright.config.ts expects from its
    // host page, so this app serves the e2e suite as-is.
    port: 3000,
    strictPort: true,
    open: false,
  },
});
