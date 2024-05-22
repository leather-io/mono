import { defineConfig } from 'tsup';

export default defineConfig({
  //   dts: true,
  entry: ['src/preset.ts'],
  external: ['leather-styles'],
  format: ['esm'],
});
