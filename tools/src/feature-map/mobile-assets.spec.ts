import { describe, expect, test } from 'vitest';

import { getFeatureMapAppConfig } from './app-config.js';
import {
  collectCallStringArguments,
  collectEndpointAccesses,
  loadFeatureFlagHookKeys,
  loadRpcDispatchHandlers,
} from './mobile-assets.js';
import { loadRpcEndpointNames } from './test-assets.js';
import { parseSourceFile } from './ts-ast.js';

const config = getFeatureMapAppConfig('mobile');

describe(collectCallStringArguments.name, () => {
  test('collects the first string argument of the named calls, once each', () => {
    const sourceFile = parseSourceFile(
      'flags.ts',
      `export function useSwapFlag() { return useBoolVariation('swap', false); }
       export function useMinVersion() { return useStringVariation('minimum_app_version', ''); }
       export function useSwapAgain() { return useBoolVariation('swap', true); }
       const other = useNumberVariation('count', 1);
       const dynamic = useBoolVariation(key, false);`
    );
    expect(
      collectCallStringArguments(sourceFile, ['useBoolVariation', 'useStringVariation'])
    ).toEqual(['swap', 'minimum_app_version']);
  });
});

describe(loadFeatureFlagHookKeys.name, () => {
  test('reads the LaunchDarkly keys of the mobile app', () => {
    const keys = loadFeatureFlagHookKeys(config.featureFlagsFile, config.featureFlagHooks ?? []);
    expect(keys).toContain('swap');
    expect(keys).toContain('release_onramper_buy');
    expect(keys).toContain('minimum_app_version');
  });
});

describe(collectEndpointAccesses.name, () => {
  test('lists identifiers read through .method or .request', () => {
    const sourceFile = parseSourceFile(
      'dispatch.tsx',
      `switch (props.request?.method) {
         case getAddresses.method: return <A />;
         case signPsbt.method: { const parsed = signPsbt.request.parse(props.request); return <B />; }
       }
       const info = getInfo.request.safeParse(message);
       const other = something.params;`
    );
    expect(collectEndpointAccesses(sourceFile).map(access => access.name)).toEqual([
      'props',
      'getAddresses',
      'signPsbt',
      'signPsbt',
      'props',
      'getInfo',
    ]);
  });
});

describe(loadRpcDispatchHandlers.name, () => {
  test('maps every browser-handled method of the mobile app to its dispatch file', () => {
    const handlers = loadRpcDispatchHandlers(
      config.rpcDispatchFiles ?? [],
      loadRpcEndpointNames(config)
    );
    expect(handlers.get('getInfo')?.file.endsWith('message-routing.ts')).toBe(true);
    expect(handlers.get('supportedMethods')?.methods).toEqual(['supportedMethods']);
    expect(handlers.get('getAddresses')?.file.endsWith('browser-approver.tsx')).toBe(true);
    expect(handlers.get('stx_callContract')?.methods).toEqual(['stx_callContract']);
    expect(handlers.has('open')).toBe(false);
    expect(handlers.size).toBe(15);
  });
});
