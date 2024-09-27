import { copy } from 'esbuild-plugin-copy';
import svgrPlugin from 'esbuild-plugin-svgr';
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['./src/**/*.{web,shared}.{ts,tsx}', './src/**/index.ts'],
  bundle: false,
  esbuildPlugins: [
    svgrPlugin({ typescript: true }),
    copy({
      copyOnStart: true,
      watch: true,
      assets: [
        {
          from: ['./src/assets/**/*'],
          to: ['./assets'],
        },
        {
          from: ['./src/assets-web/**/*'],
          to: ['./assets-web'],
        },
      ],
    }),
  ],
  onSuccess: 'panda cssgen --outfile dist-web/styles.css',
  format: ['esm'],
  tsconfig: 'tsconfig.web.json',
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
    '.svg': 'jsx',
  },
});
