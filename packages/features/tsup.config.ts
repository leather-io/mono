import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  sourcemap: true,
  clean: false,
  dts: true,
  format: 'esm',
  outDir: 'dist',
  external: [
    '@tanstack/react-query',
    '@leather.io/models',
    '@leather.io/services',
    '@leather.io/tokens',
    '@leather.io/utils',
    '@noble/hashes',
    '@noble/hashes/hmac',
    '@noble/hashes/sha256',
    '@noble/hashes/utils',
    'dayjs',
  ],
});
