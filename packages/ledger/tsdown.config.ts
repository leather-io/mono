import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts', 'src/test-utils.ts'],
  external: ['vitest'],
  dts: true,
  fixedExtension: false,
});
