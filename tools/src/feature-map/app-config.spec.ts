import { describe, expect, test } from 'vitest';

import { getFeatureMapAppConfig, toRepoRelative } from './app-config.js';

function relativeOf(file: string | undefined): string | undefined {
  return file === undefined ? undefined : toRepoRelative(file);
}

describe(getFeatureMapAppConfig.name, () => {
  test('keeps the extension on react-router files, page objects and mocks', () => {
    const config = getFeatureMapAppConfig('extension');
    expect(config.expoRouter).toBeUndefined();
    expect(config.maestro).toBeUndefined();
    expect(config.featureFlagsInterfaceName).toBe('FeatureFlags');
    expect(relativeOf(config.rpcMethodsDir)).toBe(
      'apps/extension/src/background/messaging/rpc-methods'
    );
    expect(toRepoRelative(config.outputFile)).toBe('.claude/skills/feature-map/extension.md');
  });

  test('points mobile at expo-router screens, Maestro flows and the browser dispatch', () => {
    const config = getFeatureMapAppConfig('mobile');
    expect(config.routeUrlsObjectName).toBe('AppRoutes');
    expect(toRepoRelative(config.routeUrlsFile)).toBe('apps/mobile/src/shared/app-routes.ts');
    expect(relativeOf(config.expoRouter?.appDir)).toBe('apps/mobile/src/app');
    expect(config.expoRouter?.gateComponents).toEqual({ SplashScreenGuard: 'splashScreen' });
    expect(config.maestro?.flowsDirs.map(toRepoRelative)).toEqual([
      'apps/mobile/maestro/flows',
      'apps/mobile/maestro/shared',
    ]);
    expect(relativeOf(config.maestro?.actionsDir)).toBe('apps/mobile/maestro/shared');
    expect(config.featureFlagHooks).toEqual(['useBoolVariation', 'useStringVariation']);
    expect(config.featureFlagsInterfaceName).toBeUndefined();
    expect(config.rpcMethodsDir).toBeUndefined();
    expect(config.rpcDispatchFiles?.map(toRepoRelative)).toEqual([
      'apps/mobile/src/features/browser/browser/message-routing.ts',
      'apps/mobile/src/features/browser/approver-sheet/browser-approver.tsx',
    ]);
    expect(config.mocksDir).toBeUndefined();
    expect(config.pageObjectsDir).toBeUndefined();
    expect(toRepoRelative(config.selectorsDir)).toBe('apps/mobile/src/shared/selectors');
    expect(toRepoRelative(config.outputFile)).toBe('.claude/skills/feature-map/mobile.md');
  });

  test('rejects an unknown app and names the supported ones', () => {
    expect(() => getFeatureMapAppConfig('desktop')).toThrow(
      "feature-map: unsupported app 'desktop'. Supported apps: extension, mobile"
    );
  });
});
