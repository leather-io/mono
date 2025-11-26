import svgr from '@svgr/rollup';
import copy from 'rollup-plugin-copy';
import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['exports.web.ts'],
  plugins: [
    svgr({ typescript: true }),
    copy({
      targets: [
        { src: './src/assets', dest: './dist-web' },
        { src: './src/assets-web', dest: './dist-web' },
      ],
      hook: 'buildStart',
      copyOnce: false,
    }),
  ],

  onSuccess: 'panda cssgen --outfile dist-web/styles.css',
  tsconfig: 'tsconfig.web.json',
  outDir: 'dist-web',
  dts: true,
  loader: {
    '.js': 'jsx',
    '.svg': 'jsx',
  },
  fixedExtension: false,
});
