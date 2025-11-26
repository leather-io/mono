import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/preset.ts'],
  dts: true,
  fixedExtension: false,
});
