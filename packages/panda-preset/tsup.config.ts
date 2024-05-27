import { defineConfig } from 'tsup';

// maybe I need to define this for  the UI also so that it can provide this file properly
export default defineConfig({
  entry: ['src/preset.ts'],
});
