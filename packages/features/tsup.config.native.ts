import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['./src/**/*.{native,shared}.{ts,tsx}', './src/**/index.ts'],

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
  },
});
