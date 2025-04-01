import { cloudflare } from '@cloudflare/vite-plugin';
import { viteCommonjs } from '@originjs/vite-plugin-commonjs';
import pandacss from '@pandacss/dev/postcss';
import { reactRouter } from '@react-router/dev/vite';
import path from 'node:path';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  optimizeDeps: {
    include: ['axios'],
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
      // import from 'axios' fails in SSR
      axios: path.resolve(__dirname, 'node_modules/axios/dist/browser/axios.cjs'),
      // polyfill required packages
      'safe-process': 'process/browser', // vite marks "process" package as external, this is workaround
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
      vm: 'vm-browserify',
      fs: 'browserify-fs',
      path: 'path-browserify',
      os: 'os-browserify/browser',
      assert: 'assert',
      process: 'process/browser',
      http: 'http-browserify',
      https: 'https-browserify',
      zlib: 'zlib-browserify',
      tty: 'tty-browserify',
      util: 'rollup-plugin-node-polyfills/polyfills/util.js',
      'node:crypto': 'crypto-browserify',
      'node:stream': 'stream-browserify',
      'node:vm': 'vm-browserify',
      'node:fs': 'browserify-fs',
      'node:path': 'path-browserify',
      'node:os': 'os-browserify/browser',
      'node:assert': 'assert',
      'node:process': 'process/browser',
      'node:http': 'http-browserify',
      'node:https': 'https-browserify',
      'node:zlib': 'zlib-browserify',
      'node:tty': 'tty-browserify',
      'node:util': 'rollup-plugin-node-polyfills/polyfills/util.js',
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
