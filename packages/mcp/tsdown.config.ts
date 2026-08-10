import { defineConfig } from 'tsdown';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    dts: true,
    fixedExtension: false,
    copy: [
      { from: 'src/pages/assets', to: 'dist/assets' },
      { from: 'src/pages/connect.html', to: 'dist/pages/connect.html' },
      { from: 'src/pages/approve.html', to: 'dist/pages/approve.html' },
    ],
  },
  {
    entry: { 'assets/bridge-client': 'src/pages/bridge-client.ts' },
    platform: 'browser',
    dts: false,
    fixedExtension: false,
  },
]);
