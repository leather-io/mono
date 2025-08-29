import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['index.ts'],
  format: ['esm'],
  dts: false,
  clean: true,
  outExtension() {
    return {
      js: '.js',
    };
  },
});