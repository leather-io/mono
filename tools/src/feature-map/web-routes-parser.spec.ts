import path from 'node:path';
import { describe, expect, test } from 'vitest';

import { getFeatureMapAppConfig } from './app-config.js';
import { createImportResolver } from './routers-parser.js';
import { collectStringConstObjects, parseSourceFile } from './ts-ast.js';
import {
  type RouteConfigOptions,
  parseRouteConfig,
  parseRouteConfigFile,
} from './web-routes-parser.js';

const table = new Map([
  [
    'RouteUrls',
    new Map([
      ['Index', '/'],
      ['Sbtc', '/sbtc'],
      ['Post', '/posts/:postSlug'],
      ['Multisig', '/multisig'],
      ['MultisigVault', '/multisig/vault/:vaultId'],
      ['MultisigPreview', '/multisig/preview'],
      ['Playground', '/playground'],
      ['PlaygroundGallery', '/playground/gallery'],
      ['Staking', '/staking'],
      ['StakingPool', '/staking/pool/:slug'],
      ['StakingPoolActive', '/staking/pool/:slug/active'],
      ['NotFound', '/*'],
    ]),
  ],
]);

const options: RouteConfigOptions = {
  objectName: 'RouteUrls',
  layoutGates: { 'pages/multisig/multisig.layout.tsx': 'multisigLayout' },
  conditionFlags: { "import.meta.env.MODE !== 'production'": 'nonProductionBuild' },
};

const routesSource = `
import { type RouteConfig, index, route } from '@react-router/dev/routes';

import { multisigRoutes } from './pages/multisig/multisig.routes';
import { playgroundRoutes } from './pages/playground/playground.routes';
import { stakingRoutes } from './pages/staking/staking.routes';

export default [
  index('pages/index.route.tsx'),
  route('sbtc', 'pages/sbtc/sbtc.route.tsx'),
  route('posts/:postSlug', 'pages/posts/post.route.tsx'),
  ...multisigRoutes,
  ...playgroundRoutes,
  ...stakingRoutes,
  route('*', 'pages/error/error-not-found.route.tsx'),
] satisfies RouteConfig;
`;

const multisigSource = `
import { type RouteConfigEntry, index, layout, prefix, route } from '@react-router/dev/routes';

const previewRoutes: RouteConfigEntry[] =
  import.meta.env.MODE !== 'production'
    ? [route('preview', 'pages/multisig/preview.route.tsx')]
    : [];

export const multisigRoutes: RouteConfigEntry[] = prefix('multisig', [
  ...previewRoutes,
  layout('pages/multisig/multisig.layout.tsx', [
    index('pages/multisig/multisig.route.tsx'),
    route('vault/:vaultId', 'pages/multisig/vault/vault.route.tsx'),
  ]),
]);
`;

const playgroundSource = `
import { type RouteConfigEntry, index, layout, prefix, route } from '@react-router/dev/routes';

import { playgroundAreas } from './playground-areas';

export const playgroundRoutes: RouteConfigEntry[] = prefix('playground', [
  layout('pages/playground/playground.layout.tsx', [
    index('pages/playground/playground-index.route.tsx'),
    ...playgroundAreas.map(area =>
      route(area.slug, \`pages/playground/areas/\${area.slug}/\${area.slug}.route.tsx\`)
    ),
  ]),
]);
`;

const playgroundAreasSource = `
export interface PlaygroundArea {
  slug: string;
  title: string;
}

export const playgroundAreas: PlaygroundArea[] = [
  { slug: 'gallery', title: 'Gallery', status: 'living' },
];
`;

const stakingSource = `
import { type RouteConfigEntry, index, layout, prefix, route } from '@react-router/dev/routes';

export const stakingRoutes: RouteConfigEntry[] = prefix('staking', [
  layout('pages/staking/staking.layout.tsx', [
    index('pages/staking/staking.route.tsx'),
    ...prefix('pool/:slug', [
      index('pages/staking/pool/pool-staking.route.tsx'),
      route('active', 'pages/staking/pool/pool-staking-active.route.tsx'),
    ]),
  ]),
]);
`;

const virtualRoot = '/virtual/app';
const files = new Map([
  [`${virtualRoot}/pages/multisig/multisig.routes.ts`, multisigSource],
  [`${virtualRoot}/pages/playground/playground.routes.ts`, playgroundSource],
  [`${virtualRoot}/pages/playground/playground-areas.ts`, playgroundAreasSource],
  [`${virtualRoot}/pages/staking/staking.routes.ts`, stakingSource],
]);

function parseFixture(source = routesSource) {
  return parseRouteConfig(
    `${virtualRoot}/routes.ts`,
    source,
    table,
    options,
    createImportResolver({}, file => files.get(file))
  );
}

function routeAt(model: ReturnType<typeof parseFixture>, mountedPath: string) {
  return model.routes.find(route => route.mountedPath === mountedPath);
}

describe(parseRouteConfig.name, () => {
  const model = parseFixture();

  test('mounts index, route, prefix and layout entries at their absolute paths', () => {
    expect(model.routes.map(route => route.mountedPath)).toEqual([
      '/',
      '/sbtc',
      '/posts/:postSlug',
      '/multisig/preview',
      '/multisig',
      '/multisig/vault/:vaultId',
      '/playground',
      '/playground/gallery',
      '/staking',
      '/staking/pool/:slug',
      '/staking/pool/:slug/active',
      '/*',
    ]);
    expect(model.unresolved).toEqual([]);
  });

  test('credits each mounted path to the key whose value equals it', () => {
    expect(routeAt(model, '/')?.keys).toEqual(['Index']);
    expect(routeAt(model, '/')?.isIndex).toBe(true);
    expect(routeAt(model, '/staking/pool/:slug')?.keys).toEqual(['StakingPool']);
    expect(routeAt(model, '/staking/pool/:slug')?.isIndex).toBe(true);
    expect(routeAt(model, '/*')?.keys).toEqual(['NotFound']);
    expect(model.references.get('Sbtc')?.[0]?.line).toBe(10);
  });

  test('records the route module and the file that declares each route', () => {
    expect(routeAt(model, '/sbtc')?.module).toBe('pages/sbtc/sbtc.route.tsx');
    expect(routeAt(model, '/sbtc')?.file).toBe(`${virtualRoot}/routes.ts`);
    expect(routeAt(model, '/multisig/vault/:vaultId')?.file).toBe(
      `${virtualRoot}/pages/multisig/multisig.routes.ts`
    );
    expect(routeAt(model, '/multisig/vault/:vaultId')?.module).toBe(
      'pages/multisig/vault/vault.route.tsx'
    );
  });

  test('derives gates from the layouts the config names and nothing else', () => {
    expect(routeAt(model, '/multisig')?.gates).toEqual(['multisigLayout']);
    expect(routeAt(model, '/multisig/vault/:vaultId')?.gates).toEqual(['multisigLayout']);
    expect(routeAt(model, '/multisig/preview')?.gates).toEqual([]);
    expect(routeAt(model, '/staking')?.gates).toEqual([]);
    expect(routeAt(model, '/playground/gallery')?.gates).toEqual([]);
  });

  test('flags routes registered inside a known conditional', () => {
    expect(routeAt(model, '/multisig/preview')?.flags).toEqual(['nonProductionBuild']);
    expect(routeAt(model, '/multisig')?.flags).toEqual([]);
  });

  test('expands a map over an imported registry of areas', () => {
    expect(routeAt(model, '/playground/gallery')?.module).toBe(
      'pages/playground/areas/gallery/gallery.route.tsx'
    );
    expect(routeAt(model, '/playground/gallery')?.keys).toEqual(['PlaygroundGallery']);
  });

  test('nested routes carry the keys of their mounted parents', () => {
    expect(routeAt(model, '/staking/pool/:slug/active')?.parentKeys).toEqual([]);
    expect(routeAt(model, '/multisig/vault/:vaultId')?.parentKeys).toEqual([]);
  });

  test('reports unknown conditions, helpers and missing imports', () => {
    const broken = parseFixture(`
import { route } from '@react-router/dev/routes';
import { missingRoutes } from './pages/missing/missing.routes';
export default [
  ...(process.env.PREVIEW ? [route('preview', 'pages/preview.route.tsx')] : []),
  ...makeRoutes('x'),
  ...missingRoutes,
  route(computePath(), 'pages/computed.route.tsx'),
];
`);
    expect(broken.unresolved.map(item => item.text)).toEqual([
      'process.env.PREVIEW',
      "makeRoutes('x')",
      'missingRoutes',
      'computePath()',
    ]);
    expect(broken.routes.map(route => route.mountedPath)).toEqual(['/preview']);
  });

  test('reports a route config without a default export', () => {
    const empty = parseFixture('export const nothing = [];');
    expect(empty.routes).toEqual([]);
    expect(empty.unresolved[0]?.text).toBe('no default export of route config entries');
  });
});

describe(parseRouteConfigFile.name, () => {
  const config = getFeatureMapAppConfig('web');
  const routeConfigFile = config.routeConfigFile ?? '';
  const routeUrls = collectStringConstObjects(parseSourceFile(config.routeUrlsFile));

  test('resolves every route of the web app to a RouteUrls key', () => {
    const model = parseRouteConfigFile(
      routeConfigFile,
      routeUrls,
      {
        objectName: config.routeUrlsObjectName,
        layoutGates: config.layoutGates ?? {},
        conditionFlags: config.conditionFlags ?? {},
      },
      config.importAliases
    );
    expect(model.unresolved).toEqual([]);
    expect(model.routes.filter(route => route.keys.length === 0)).toEqual([]);
    expect(model.routes.find(route => route.mountedPath === '/staking/status')?.file).toBe(
      path.join(config.appDir, 'app/pages/bitcoin-staking/bitcoin-staking.routes.ts')
    );
    expect(model.routes.find(route => route.mountedPath === '/multisig/settings')?.gates).toEqual([
      'multisigLayout',
    ]);
    expect(
      model.routes.find(route => route.mountedPath === '/multisig/sidebar-preview')?.flags
    ).toEqual(['nonProductionBuild']);
    expect(model.routes.find(route => route.mountedPath === '/playground')?.gates).toEqual([
      'playgroundLayout',
    ]);
  });
});
