import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts', 'src/injected-provider.ts', 'src/mobile.ts'],
  sourcemap: true,
  clean: false,
  dts: true,
  format: 'esm',
  splitting: false,
});
