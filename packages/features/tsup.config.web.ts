import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['./src/**/*.{web,shared}.{ts,tsx}', './src/**/index.ts'],
  inject: ['./react-shim.js'],
  bundle: false,

  format: ['esm'],
  tsconfig: 'tsconfig.web.json',
  experimentalDts: true,

  outDir: 'dist-web',
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
  },
});
