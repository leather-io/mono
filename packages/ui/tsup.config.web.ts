import { clean } from 'esbuild-plugin-clean';
import svgrPlugin from 'esbuild-plugin-svgr';
import { defineConfig } from 'tsup';

export default defineConfig({
  bundle: false,
  entry: ['web.ts'],
  esbuildPlugins: [
    svgrPlugin({ typescript: true }),
    clean({
      cleanOnEndPatterns: ['./dist-web/src/assets-native'],
    }),
  ],
  esbuildOptions(options, _) {
    options.outbase = './';
  },
  format: ['esm'],
  tsconfig: 'tsconfig.web.json',
  outDir: 'dist-web/',
  dts: true,
  clean: false,
  minify: true,
  minifyIdentifiers: true,
  minifySyntax: true,
  minifyWhitespace: true,
  splitting: true,
  treeshake: true,
  target: 'esnext',
  loader: {
    '.js': 'jsx',
    '.svg': 'jsx',
  },
});
