import fs from 'fs';
import path from 'path';
import { Plugin } from 'vite';

export function copyMswWorker(): Plugin {
  const source = path.resolve(__dirname, '../node_modules/msw/lib/mockServiceWorker.js');
  const dest = path.resolve(__dirname, '../public/mockServiceWorker.js');

  function copy() {
    fs.copyFileSync(source, dest);
  }

  return {
    name: 'copy-msw-worker',
    buildEnd() {
      copy();
    },
    configureServer() {
      copy();
    },
  };
}
