import { defineConfig } from 'tsdown';

// build separately as tsdown/rolldown doesn't support opting-out of code-splitting
// and we need to keep dist/mobile.js as a separately bundled file without imports
// https://github.com/rolldown/rolldown/issues/3986
export default defineConfig([
  {
    entry: ['src/index.ts'],
    dts: true,
    fixedExtension: false,
  },
  {
    entry: ['src/injected-provider.ts', 'src/mobile.ts'],
    dts: true,
    fixedExtension: false,
  },
]);
