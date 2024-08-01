import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['web.ts'],
  format: ['esm'],
  tsconfig: 'tsconfig.web.json',
  outDir: 'dist-web/',
  dts: true,
  clean: true,
  minify: true,
  minifyIdentifiers: true,
  minifySyntax: true,
  minifyWhitespace: true,
  splitting: true,
  treeshake: true,
  target: 'esnext',
  loader: {
    '.js': 'jsx',
    '.jsx': 'jsx',
  },
});
