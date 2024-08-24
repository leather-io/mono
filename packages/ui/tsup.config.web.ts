import { copy } from 'esbuild-plugin-copy';
import svgrPlugin from 'esbuild-plugin-svgr';
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['web.ts'],
  esbuildPlugins: [
    svgrPlugin({ typescript: true }),
    copy({
      assets: [
        {
          from: ['./src/assets/**/*'],
          to: ['./src/assets'],
        },
        {
          from: ['./src/assets-web/**/*'],
          to: ['./src/assets-web'],
        },
      ],
      copyOnStart: true,
      watch: true,
    }),
  ],
  onSuccess: 'tsc --build tsconfig.json',
  format: ['esm'],
  tsconfig: 'tsconfig.web.json',
  outDir: 'dist-web/',
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
