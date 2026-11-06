import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, test } from 'vitest';

import { getFeatureMapAppConfig } from './app-config.js';
import {
  loadMockFunctions,
  loadNetworkIds,
  loadPersistedSliceKeys,
  loadRouterFiles,
  loadRpcCatalog,
  loadRpcEndpoints,
  loadRpcHandlers,
  loadSelectors,
  loadSetupMocks,
  loadVerifyMockNames,
} from './test-assets.js';

const config = getFeatureMapAppConfig('extension');
const tempDir = mkdtempSync(path.join(tmpdir(), 'feature-map-assets-'));

describe(loadSelectors.name, () => {
  test('enumerates every exported *Selectors object with its members and values', () => {
    const { table, objects } = loadSelectors(config);
    const switcher = objects.get('SwitchAccountSelectors');
    expect(switcher?.file.endsWith('switch-account.selectors.ts')).toBe(true);
    expect(switcher?.members).toContain('WalletHeaderName');
    expect(table.get('SwitchAccountSelectors')?.has('WalletHeaderName')).toBe(true);
    expect(objects.has('getSwitchAccountSheetAccountNameSelector')).toBe(false);
    expect([...objects.keys()].every(name => name.endsWith('Selectors'))).toBe(true);
  });
});

describe(loadSetupMocks.name, () => {
  test('lists the exported mock functions setupMockApis registers', () => {
    const setup = loadSetupMocks(config, loadMockFunctions(config));
    expect(setup?.file.endsWith('mock-apis.ts')).toBe(true);
    expect(setup?.members).toContain('mockStacksFeeRequests');
    expect(setup?.members).toContain('mockNetworkValidationRequests');
    expect(setup?.members).not.toContain('setupMockApis');
    expect(setup?.members).not.toContain('mockUnhandledRequests');
  });

  test('is undefined when the mocks dir has no such function', () => {
    const setup = loadSetupMocks(
      { ...config, setupMocksFunctionName: 'setupNothing' },
      loadMockFunctions(config)
    );
    expect(setup).toBeUndefined();
  });
});

describe(loadRpcHandlers.name, () => {
  test('enumerates handler files by basename with the methods they register', () => {
    const handlers = loadRpcHandlers(config, loadRpcEndpoints(config));
    expect(handlers.get('open')?.methods).toEqual(['open']);
    expect(handlers.get('supported-methods')?.methods).toEqual(['supportedMethods']);
    expect(handlers.get('open')?.file.endsWith('rpc-methods/open.ts')).toBe(true);
    expect([...handlers.keys()].some(name => name.endsWith('.spec'))).toBe(false);
  });
});

describe(loadRouterFiles.name, () => {
  test('discovers files that render a Route or are named as route groups, minus the exclude list', () => {
    const appDir = path.join(tempDir, 'app');
    const files = {
      'features/x/x-routes.tsx': 'export const xRoutes = generateRpcRoutes({ path: RouteUrls.X });',
      'routes/y-stuff.tsx': 'export function Y() { return <Routes><Route path="/y" /></Routes>; }',
      'routes/wrapper.tsx': 'export function W() { return <Route path="*" />; }',
      'components/plain.tsx': 'export function Plain() { return <div />; }',
      'routes/y-stuff.spec.tsx': 'test("x", () => <Route />);',
    };
    for (const [name, text] of Object.entries(files)) {
      mkdirSync(path.dirname(path.join(appDir, name)), { recursive: true });
      writeFileSync(path.join(appDir, name), text);
    }
    const discovered = loadRouterFiles({
      ...config,
      routerScanDirs: [appDir],
      routerExcludeFiles: [path.join(appDir, 'routes/wrapper.tsx')],
    });
    expect(discovered).toEqual([
      path.join(appDir, 'features/x/x-routes.tsx'),
      path.join(appDir, 'routes/y-stuff.tsx'),
    ]);
  });

  test('finds every router file of the extension', () => {
    const names = loadRouterFiles(config).map(file => path.basename(file));
    expect(names).toContain('app-routes.tsx');
    expect(names).toContain('rpc-routes.tsx');
    expect(names).toContain('home.tsx');
    expect(names).toContain('rpc-stx-call-contract.routes.tsx');
    expect(names).not.toContain('modal-background-wrapper.tsx');
  });
});

describe(loadPersistedSliceKeys.name, () => {
  test('reads the persist whitelist as the list of slices verify may write', () => {
    const slices = loadPersistedSliceKeys(config);
    expect(slices).toContain('softwareKeys');
    expect(slices).toContain('wallets');
    expect(slices).not.toContain('all');
  });
});

describe(loadNetworkIds.name, () => {
  test('reads the wallet network ids from the models package', () => {
    const ids = loadNetworkIds(config);
    expect(ids).toContain('mainnet');
    expect(ids).toContain('testnet4');
  });
});

describe(loadRpcCatalog.name, () => {
  test('maps every test-app catalog id to its rpc method', () => {
    const catalog = loadRpcCatalog(config);
    expect(catalog.get('stx_callContract')).toBe('stx_callContract');
    expect(catalog.get('open-popup')).toBe('open');
    expect(catalog.get('signMessage-p2wpkh')).toBe('signMessage');
    expect(catalog.size).toBeGreaterThan(20);
  });
});

describe(loadVerifyMockNames.name, () => {
  test('reads the base mocks and the registry object keys verify can apply', () => {
    const names = loadVerifyMockNames(config);
    expect(names.has('setupMockApis')).toBe(true);
    expect(names.has('mockUnhandledRequests')).toBe(true);
    expect(names.has('mockStacksFeeRequests')).toBe(true);
    expect(names.has('mockBitcoinMainnetBroadcast')).toBe(true);
    expect(names.has('mockBnsV2NameLookup')).toBe(false);
  });
});
