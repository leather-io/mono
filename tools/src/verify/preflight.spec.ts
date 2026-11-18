import { describe, expect, test } from 'vitest';

import { checkDist, devServerWarning, distMissingMessage, findDevServer } from './preflight.js';

describe(checkDist.name, () => {
  test('names the build command when the manifest is missing', () => {
    expect(checkDist('/nowhere/dist/manifest.json')).toBe(
      distMissingMessage('/nowhere/dist/manifest.json')
    );
    expect(distMissingMessage('/x/manifest.json')).toContain(
      'pnpm --filter @leather.io/extension build:test'
    );
  });

  test('passes when the manifest exists', () => {
    expect(checkDist(new URL(import.meta.url).pathname)).toBeUndefined();
  });
});

describe(findDevServer.name, () => {
  const root = '/Users/me/mono';

  test('finds a vite dev server for the worktree and ignores builds and other trees', () => {
    const ps = [
      'node /Users/me/other/node_modules/.bin/vite --mode development',
      'node /Users/me/mono/node_modules/.bin/vite build --mode testing',
      'node /Users/me/mono/node_modules/.bin/vite --mode development',
    ].join('\n');
    expect(findDevServer(ps, root)).toBe(
      'node /Users/me/mono/node_modules/.bin/vite --mode development'
    );
    expect(findDevServer('node something else', root)).toBeUndefined();
    expect(findDevServer(undefined, root)).toBeUndefined();
  });

  test('warns with the fix', () => {
    expect(devServerWarning('node vite')).toContain('stop it or pass --build');
  });
});
