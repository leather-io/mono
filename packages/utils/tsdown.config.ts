import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  sourcemap: true,
  clean: false,
  dts: true,
  format: 'esm',
  external: ['dompurify'],
});
