import { viteCommonjs } from '@originjs/vite-plugin-commonjs';
import pandacss from '@pandacss/dev/postcss';
import { reactRouter } from '@react-router/dev/vite';
import { cloudflareDevProxy } from '@react-router/dev/vite/cloudflare';
import path from 'node:path';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import tsconfigPaths from 'vite-tsconfig-paths';

const knownIcons = [
  'house-16-16.svg',
  'pulse-16-16.svg',
  'paper-plane-16-16.svg',
  'inbox-16-16.svg',
  'arrows-repeat-left-right-16-16.svg',
  'arrow-right-left-16-16.svg',
  'exit-16-16.svg',
  'chevron-down-16-16.svg',
  'newspaper-16-16.svg',
  'glasses-16-16.svg',
  'terminal-16-16.svg',
  'support-16-16.svg',
  'leather-lettermark-24-24.svg',
];

export default defineConfig(({ isSsrBuild }) => ({
  build: {
    rollupOptions: isSsrBuild
      ? {
          input: './workers/app.ts',
        }
      : undefined,
  },
  css: {
    postcss: {
      // Type error with Panda plugin
      plugins: [pandacss] as any,
    },
  },
  resolve: {
    alias: {
      'leather-styles': path.resolve(__dirname, 'leather-styles'),
    },
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: knownIcons.map(icon => `node_modules/@leather.io/ui/dist-web/assets/icons/${icon}`),
          dest: 'assets/icons',
        },
      ],
    }) as any,
    cloudflareDevProxy({
      getLoadContext({ context }) {
        return { cloudflare: context.cloudflare };
      },
    }),
    viteCommonjs(),
    reactRouter(),
    tsconfigPaths(),
    nodePolyfills({ globals: { Buffer: true } }), // Buffer is required for bitcoinjs-lib
  ],
}));
