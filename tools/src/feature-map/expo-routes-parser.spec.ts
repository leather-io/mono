import { describe, expect, test } from 'vitest';

import {
  collectLayoutGates,
  expoRoutePath,
  isExpoScreenFile,
  parseExpoRoutes,
} from './expo-routes-parser.js';
import { parseSourceFile } from './ts-ast.js';

const appDir = '/virtual/apps/mobile/src/app';

const table = new Map([
  [
    'AppRoutes',
    new Map([
      ['Home', '/'],
      ['TokenDetails', '/[assetId]'],
      ['Activity', '/activity'],
      ['Settings', '/settings'],
      ['SettingsConfigureWallet', '/settings/wallet/configure/[wallet]'],
      ['Stale', '/stale'],
    ]),
  ],
]);

const layouts = new Map([
  [
    `${appDir}/_layout.tsx`,
    `export default function RootLayout() {
      return (
        <SplashScreenGuard>
          <VersionGuard />
          <Stack screenOptions={{ headerShown: false }} />
        </SplashScreenGuard>
      );
    }`,
  ],
  [`${appDir}/(tabs)/_layout.tsx`, `export default TabLayout;`],
]);

const screens = [
  `${appDir}/(tabs)/(index)/index.tsx`,
  `${appDir}/(tabs)/(index)/[assetId]/index.tsx`,
  `${appDir}/(tabs)/activity.tsx`,
  `${appDir}/settings/index.tsx`,
  `${appDir}/settings/wallet/configure/[wallet]/index.tsx`,
  `${appDir}/orphan.tsx`,
];

const gateComponents = { SplashScreenGuard: 'splashScreen' };

function parseFixture() {
  return parseExpoRoutes(
    { appDir, gateComponents },
    screens,
    file => layouts.get(file),
    table,
    'AppRoutes'
  );
}

describe(isExpoScreenFile.name, () => {
  test('accepts screen files and rejects layouts, special files and specs', () => {
    expect(isExpoScreenFile(`${appDir}/settings/index.tsx`)).toBe(true);
    expect(isExpoScreenFile(`${appDir}/(tabs)/activity.tsx`)).toBe(true);
    expect(isExpoScreenFile(`${appDir}/_layout.tsx`)).toBe(false);
    expect(isExpoScreenFile(`${appDir}/+not-found.tsx`)).toBe(false);
    expect(isExpoScreenFile(`${appDir}/settings/index.spec.tsx`)).toBe(false);
    expect(isExpoScreenFile(`${appDir}/settings/notes.md`)).toBe(false);
  });
});

describe(expoRoutePath.name, () => {
  test('strips the extension, index and group segments', () => {
    expect(expoRoutePath(appDir, `${appDir}/(tabs)/(index)/index.tsx`)).toEqual({
      routeName: '(tabs)/(index)',
      mountedPath: '/',
    });
    expect(expoRoutePath(appDir, `${appDir}/(tabs)/(index)/[assetId]/index.tsx`)).toEqual({
      routeName: '(tabs)/(index)/[assetId]',
      mountedPath: '/[assetId]',
    });
    expect(expoRoutePath(appDir, `${appDir}/(tabs)/activity.tsx`)).toEqual({
      routeName: '(tabs)/activity',
      mountedPath: '/activity',
    });
    expect(
      expoRoutePath(appDir, `${appDir}/settings/wallet/configure/[wallet]/view-secret-key.tsx`)
    ).toEqual({
      routeName: 'settings/wallet/configure/[wallet]/view-secret-key',
      mountedPath: '/settings/wallet/configure/[wallet]/view-secret-key',
    });
  });
});

describe(collectLayoutGates.name, () => {
  test('maps the gate components a layout renders, once each', () => {
    const sourceFile = parseSourceFile(
      'layout.tsx',
      `export function L() { return <A><SplashScreenGuard><B /><SplashScreenGuard /></SplashScreenGuard></A>; }`
    );
    expect(collectLayoutGates(sourceFile, gateComponents)).toEqual(['splashScreen']);
    expect(collectLayoutGates(sourceFile, {})).toEqual([]);
  });
});

describe(parseExpoRoutes.name, () => {
  const model = parseFixture();

  test('mounts one route per screen file, sorted by path, with the key whose value matches', () => {
    expect(model.routes.map(route => route.mountedPath)).toEqual([
      '/',
      '/[assetId]',
      '/activity',
      '/orphan',
      '/settings',
      '/settings/wallet/configure/[wallet]',
    ]);
    expect(model.routes[0]?.keys).toEqual(['Home']);
    expect(model.routes[0]?.file).toBe(`${appDir}/(tabs)/(index)/index.tsx`);
    expect(model.routes[1]?.keys).toEqual(['TokenDetails']);
    expect(model.routes[3]?.keys).toEqual([]);
    expect(model.routes.every(route => !route.isIndex && route.parentKeys.length === 0)).toBe(true);
  });

  test('derives gates from every _layout file above the screen', () => {
    expect(model.routes.map(route => route.gates)).toEqual(
      model.routes.map(() => ['splashScreen'])
    );
    const ungated = parseExpoRoutes(
      { appDir, gateComponents },
      screens,
      () => undefined,
      table,
      'AppRoutes'
    );
    expect(ungated.routes.every(route => route.gates.length === 0)).toBe(true);
  });

  test('references come from the mounted screens only', () => {
    expect(model.references.get('Activity')?.[0]?.file).toBe(`${appDir}/(tabs)/activity.tsx`);
    expect(model.references.has('Stale')).toBe(false);
    expect(model.unresolved).toEqual([]);
  });
});
