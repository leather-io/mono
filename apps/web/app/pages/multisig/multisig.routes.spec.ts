import type { RouteConfigEntry } from '@react-router/dev/routes';

import { multisigRoutes } from './multisig.routes';

// route()/prefix()/layout()/index() execute at module load and return concrete
// objects, so we can assert the route table's shape without rendering.
function collect(entries: RouteConfigEntry[], paths: string[], flags: { hasIndex: boolean }): void {
  for (const entry of entries) {
    if (entry.path) paths.push(entry.path);
    if (entry.index) flags.hasIndex = true;
    if (entry.children) collect(entry.children, paths, flags);
  }
}

describe('multisigRoutes', () => {
  const paths: string[] = [];
  const flags = { hasIndex: false };
  collect(multisigRoutes, paths, flags);

  test('mounts an index route (the dashboard) under the multisig layout', () => {
    expect(flags.hasIndex).toBe(true);
  });

  test('registers every multisig screen route', () => {
    function endsWith(suffix: string) {
      return paths.some(p => p.endsWith(suffix));
    }
    expect(endsWith('onboarding')).toBe(true);
    expect(endsWith('create-vault')).toBe(true);
    expect(endsWith('settings')).toBe(true);
    expect(endsWith('vault/:vaultId')).toBe(true);
    expect(endsWith('account/:accountId')).toBe(true);
    expect(endsWith('tx/:txId')).toBe(true);
  });
});
