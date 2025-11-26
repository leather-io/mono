import svgr from '@svgr/rollup';
import copy from 'rollup-plugin-copy';
import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['native.ts'],
  plugins: [
    svgr({ native: true, typescript: true }),
    copy({
      targets: [
        { src: './src/assets', dest: './dist-native/src' },
        { src: './src/assets-native', dest: './dist-native/src' },
      ],
      hook: 'buildStart',
      copyOnce: false,
    }),
  ],

  tsconfig: 'tsconfig.native.json',
  outDir: 'dist-native',
  dts: true,
  loader: {
    '.js': 'jsx',
    '.otf': 'asset',
    '.png': 'asset',
    '.svg': 'jsx',
    '.ttf': 'asset',
  },
  fixedExtension: false,
});
