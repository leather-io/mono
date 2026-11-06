import path from 'node:path';
import { describe, expect, test } from 'vitest';

import { getFeatureMapAppConfig } from './app-config.js';
import { checkExpoRoutes } from './expo-routes-check.js';
import { type FeatureMapModel } from './model.js';
import { type RoutedRoute } from './routers-parser.js';

const config = getFeatureMapAppConfig('mobile');
const appDir = path.join(config.appDir, 'src/app');

function route(file: string, mountedPath: string, keys: string[]): RoutedRoute {
  return {
    file: path.join(appDir, file),
    line: 1,
    keys,
    path: mountedPath.slice(1),
    mountedPath,
    gates: [],
    flags: [],
    parentKeys: [],
    isIndex: false,
  };
}

function model(routes: RoutedRoute[]): FeatureMapModel {
  return {
    config,
    routeUrls: new Map([
      ['Home', '/'],
      ['Settings', '/settings'],
      ['Stale', '/stale'],
    ]),
    selectorTable: new Map(),
    router: {
      routes,
      references: new Map(
        routes.flatMap(item =>
          item.keys.map(key => [key, [{ key, file: item.file, line: item.line }]] as const)
        )
      ),
      unresolved: [],
    },
    features: [],
    parseErrors: [],
    pageObjectActions: new Map(),
    mocks: new Map(),
    setupMocks: undefined,
    specs: new Map(),
    flags: [],
    rpcMethods: new Set(),
    selectorObjects: new Map(),
    rpcHandlers: new Map(),
  };
}

describe(checkExpoRoutes.name, () => {
  test('reports a screen without a key and a key without a screen', () => {
    const errors = checkExpoRoutes(
      model([
        route('(tabs)/(index)/index.tsx', '/', ['Home']),
        route('settings/index.tsx', '/settings', ['Settings']),
        route('settings/appearance/index.tsx', '/settings/appearance', []),
      ])
    );
    expect(errors).toEqual([
      [
        "screen apps/mobile/src/app/settings/appearance/index.tsx routes at '/settings/appearance' but no AppRoutes key has that value.",
        "Fix: add a key with value '/settings/appearance' to apps/mobile/src/shared/app-routes.ts and claim it in an entry.",
      ].join('\n'),
      [
        "AppRoutes.Stale ('/stale') matches no screen file under apps/mobile/src/app.",
        "Fix: point the value at the screen's path (its file path without the extension, index and (group) segments) or remove the key.",
      ].join('\n'),
    ]);
  });

  test('is silent for the extension config', () => {
    const extension = { ...model([]), config: getFeatureMapAppConfig('extension') };
    expect(checkExpoRoutes(extension)).toEqual([]);
  });
});
