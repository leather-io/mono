import { viteCommonjs } from '@originjs/vite-plugin-commonjs';
import pandacss from '@pandacss/dev/postcss';
import { reactRouter } from '@react-router/dev/vite';
import { cloudflareDevProxy } from '@react-router/dev/vite/cloudflare';
import path from 'node:path';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

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
    svgr({ include: '**/*.svg' }),
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
