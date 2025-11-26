import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts', 'src/wallet/index.ts', 'src/keychains/index.ts'],
  dts: true,
  fixedExtension: false,
});
