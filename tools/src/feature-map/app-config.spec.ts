import { existsSync } from 'node:fs';
import { describe, expect, test } from 'vitest';

import { getFeatureMapAppConfig, toRepoRelative } from './app-config.js';
import { webFeatureGates, webFeatureSessions } from './feature-entry.js';
import { featureVocabularyOf } from './model.js';

function relative(file: string | undefined): string | undefined {
  return file === undefined ? undefined : toRepoRelative(file);
}

describe(getFeatureMapAppConfig.name, () => {
  test('the extension config keeps its rpc, page-object and mock sources', () => {
    const config = getFeatureMapAppConfig('extension');
    expect(relative(config.rpcMethodsDir)).toBe(
      'apps/extension/src/background/messaging/rpc-methods'
    );
    expect(relative(config.pageObjectsDir)).toBe('apps/extension/tests/page-object-models');
    expect(config.setupMocksFunctionName).toBe('setupMockApis');
    expect(config.routeConfigFile).toBeUndefined();
    expect(config.readySelectorRequired).toBeUndefined();
    expect(featureVocabularyOf(config).gates).toContain('account');
  });

  test('the web config reads the route config, has no rpc or page objects and relaxes ready', () => {
    const config = getFeatureMapAppConfig('web');
    expect(relative(config.routeConfigFile)).toBe('apps/web/app/routes.ts');
    expect(toRepoRelative(config.routeUrlsFile)).toBe('apps/web/app/route-urls.ts');
    expect(toRepoRelative(config.outputFile)).toBe('.claude/skills/feature-map/web.md');
    expect(config.rpcMethodsDir).toBeUndefined();
    expect(config.rpcEndpointsDir).toBeUndefined();
    expect(config.pageObjectsDir).toBeUndefined();
    expect(config.featureFlagsFile).toBeUndefined();
    expect(config.setupMocksFunctionName).toBeUndefined();
    expect(config.readySelectorRequired).toBe(false);
    expect(config.routeKeysRequired).toBe(true);
    expect(featureVocabularyOf(config)).toEqual({
      gates: webFeatureGates,
      sessions: webFeatureSessions,
    });
    for (const dir of [config.featuresDir, config.selectorsDir, config.mocksDir, config.specsDir]) {
      expect(dir !== undefined && existsSync(dir)).toBe(true);
    }
  });

  test('rejects an unknown app with the supported list', () => {
    expect(() => getFeatureMapAppConfig('desktop')).toThrow(
      "feature-map: unsupported app 'desktop'. Supported apps: extension, web"
    );
  });
});
