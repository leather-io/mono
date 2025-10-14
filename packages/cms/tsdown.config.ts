import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['index.ts'],
  format: ['esm'],
  dts: false,
  clean: true,
});
