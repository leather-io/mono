import { type Options, defineConfig } from 'tsup';

export default defineConfig(<Options>{
  entry: ['src/index.ts'],
  sourcemap: true,
  clean: false,
  dts: true,
  format: 'esm',
});
