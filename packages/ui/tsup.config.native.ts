import { copy } from 'esbuild-plugin-copy';
import svgrPlugin from 'esbuild-plugin-svgr';
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['native.ts'],
  esbuildPlugins: [
    svgrPlugin({ native: true, typescript: true }),
    copy({
      assets: [
        {
          from: ['./src/assets/**/*'],
          to: ['./src/assets'],
        },
        {
          from: ['./src/assets-native/**/*'],
          to: ['./src/assets-native'],
        },
      ],
      copyOnStart: true,
      watch: true,
    }),
  ],
  inject: ['./react-shim.js'],
  format: ['esm'],
  tsconfig: 'tsconfig.native.json',
  outDir: 'dist-native',
  experimentalDts: true,
  clean: false,
  minify: true,
  minifyIdentifiers: true,
  minifySyntax: true,
  minifyWhitespace: true,
  splitting: true,
  treeshake: true,
  target: 'es2022',
  loader: {
    '.js': 'jsx',
    '.otf': 'file',
    '.png': 'file',
    '.svg': 'jsx',
    '.ttf': 'file',
  },
});
