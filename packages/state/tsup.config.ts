import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/*/index.ts'],
  sourcemap: true,
  clean: false,
  dts: true,
  format: 'esm',
});
