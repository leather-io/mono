import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: { index: 'src/index.ts', kernel: 'src/kernel/index.ts' },
  dts: true,
  external: ['dompurify'],
  fixedExtension: false,
});
