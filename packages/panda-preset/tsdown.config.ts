import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/preset.ts'],
  format: ['esm'],
});
