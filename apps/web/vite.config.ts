import { cloudflare } from '@cloudflare/vite-plugin';
import { viteCommonjs } from '@originjs/vite-plugin-commonjs';
import pandacss from '@pandacss/dev/postcss';
import { reactRouter } from '@react-router/dev/vite';
import path from 'node:path';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  css: {
    postcss: {
      // Type error with Panda plugin
      plugins: [pandacss] as any,
    },
  },
  resolve: {
    alias: {
      'leather-styles': path.resolve(__dirname, 'leather-styles'),
      // polyfill required packages
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
      vm: 'vm-browserify',
      fs: 'browserify-fs',
      path: 'path-browserify',
      os: 'os-browserify/browser',
      assert: 'assert',
      process: 'process/browser',
      'node:crypto': 'crypto-browserify',
      'node:stream': 'stream-browserify',
      'node:vm': 'vm-browserify',
      'node:fs': 'browserify-fs',
      'node:path': 'path-browserify',
      'node:os': 'os-browserify/browser',
      'node:assert': 'assert',
      'node:process': 'process/browser',
      'safe-process': 'process/browser', // vite marks "process" package as external, this is workaround
    },
  },
  define: {
    global: 'globalThis', // required for some libs (e.g. pbkdf2)
  },
  plugins: [
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    svgr({ include: '**/*.svg' }),
    viteCommonjs(),
    reactRouter(),
    tsconfigPaths(),
  ],
});
