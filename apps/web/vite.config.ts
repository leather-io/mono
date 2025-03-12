import { viteCommonjs } from '@originjs/vite-plugin-commonjs';
import pandacss from '@pandacss/dev/postcss';
import { reactRouter } from '@react-router/dev/vite';
import { cloudflareDevProxy } from '@react-router/dev/vite/cloudflare';
import path from 'node:path';
import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import tsconfigPaths from 'vite-tsconfig-paths';

const knownIcons = [
  'house',
  'pulse',
  'paper-plane',
  'inbox',
  'arrows-repeat-left-right',
  'arrow-right-left',
  'exit',
  'chevron-down',
  'newspaper',
  'glasses',
  'terminal',
  'support',
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
          src: knownIcons.map(
            icon => `node_modules/@leather.io/ui/dist-web/assets/icons/${icon}-16-16.svg`
          ),
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
  ],
}));
