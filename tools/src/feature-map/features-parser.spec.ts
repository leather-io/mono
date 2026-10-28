import path from 'node:path';
import { describe, expect, test } from 'vitest';

import { getMonorepoRoot } from '../utils/paths.js';
import { parseFeaturesSource } from './features-parser.js';

const table = new Map([
  [
    'RouteUrls',
    new Map([
      ['Sell', '/sell'],
      ['Home', '/'],
    ]),
  ],
  [
    'HomePageSelectors',
    new Map([
      ['SellBtn', 'sell-btn'],
      ['HomePageContainer', 'home-page-container'],
    ]),
  ],
]);

const file = path.join(getMonorepoRoot(), 'apps/extension/tests/feature-map/home.features.ts');

const validSource = `
import { RouteUrls } from '@shared/route-urls';
import { HomePageSelectors } from '@tests/selectors/home.selectors';

const homeSpec = 'apps/extension/tests/specs/home/home.spec.ts';
const defaultMocks = ['setupMockApis'] as const;

export const homeFeatures = [
  {
    id: 'sell',
    anchor: { kind: 'route' },
    routes: [RouteUrls.Sell],
    params: [{ name: 'chain', example: 'bitcoin' }],
    entry: [{ kind: 'nav', steps: ['Click Sell'] }, { kind: 'rpc', steps: ['Call'], method: 'open' }],
    gate: 'account',
    flags: ['releaseOnramperSell'],
    preconditions: { session: 'signed-in', network: 'mainnet', mocks: [...defaultMocks, 'mockSell'] },
    selectors: { ready: HomePageSelectors.SellBtn, others: [HomePageSelectors.HomePageContainer] },
    actions: ['HomePage.goToSell'],
    specs: [homeSpec],
    description: 'Sell tokens for cash.',
  },
] as const satisfies readonly ExtensionFeatureEntry[];
`;

describe(parseFeaturesSource.name, () => {
  test('resolves member references, local constants and spreads', () => {
    const result = parseFeaturesSource(file, validSource, table);
    expect(result.errors).toEqual([]);
    expect(result.features).toHaveLength(1);
    const feature = result.features[0];
    expect(feature?.group).toBe('home');
    expect(feature?.line).toBe(9);
    expect(feature?.routes).toEqual([{ value: '/sell', ref: 'RouteUrls.Sell' }]);
    expect(feature?.selectors.ready).toEqual({
      value: 'sell-btn',
      ref: 'HomePageSelectors.SellBtn',
    });
    expect(feature?.preconditions.mocks).toEqual(['setupMockApis', 'mockSell']);
    expect(feature?.specs).toEqual(['apps/extension/tests/specs/home/home.spec.ts']);
    expect(feature?.entry[1]).toEqual({ kind: 'rpc', steps: ['Call'], method: 'open' });
    expect(feature?.params).toEqual([{ name: 'chain', example: 'bitcoin' }]);
  });

  test('reports missing fields, bad enum values and non-kebab ids with a location', () => {
    const result = parseFeaturesSource(
      file,
      `export const f = [{ id: 'Bad Id', routes: [RouteUrls.Home], gate: 'vip', entry: [{ kind: 'nav', steps: [] }] }] as const;`,
      table
    );
    expect(result.features).toEqual([]);
    const location = 'apps/extension/tests/feature-map/home.features.ts:1';
    expect(result.errors).toEqual(
      expect.arrayContaining([
        `${location}: id 'Bad Id' must be kebab-case`,
        `${location}: field 'gate' must be one of account, onboarding, ledgerStacks, ledgerBitcoin, none, splashScreen, got 'vip'`,
        `${location}: missing field 'anchor'`,
        `${location}: missing field 'preconditions'`,
        `${location}: missing field 'selectors'`,
        `${location}: missing field 'description'`,
      ])
    );
  });

  test('resolves shorthand properties and refuses spreads', () => {
    const source = `const routes = [RouteUrls.Sell];
const preconditions = { session: 'signed-in', mocks: [] };
const base = { gate: 'account' };
export const f = [
  { id: 'short', anchor: { kind: 'route' }, routes, deepLinkable: false, params: [], entry: [], gate: 'none', flags: [],
    preconditions, selectors: { ready: HomePageSelectors.SellBtn, others: [] }, actions: [], specs: [], description: 'x' },
  { ...base, id: 'spread', anchor: { kind: 'route' }, routes: [RouteUrls.Sell], params: [], entry: [], flags: [],
    preconditions: { session: 'signed-in', mocks: [] }, selectors: { ready: HomePageSelectors.SellBtn, others: [] }, actions: [], specs: [], description: 'x' },
  { id: 'nested', anchor: { kind: 'route' }, routes: [RouteUrls.Sell], params: [], entry: [], gate: 'none', flags: [],
    preconditions: { ...preconditions }, selectors: { ready: HomePageSelectors.SellBtn, others: [] }, actions: [], specs: [], description: 'x' },
];`;
    const result = parseFeaturesSource(file, source, table);
    expect(result.features.map(feature => feature.id)).toEqual(['short']);
    expect(result.features[0]?.routes).toEqual([{ value: '/sell', ref: 'RouteUrls.Sell' }]);
    expect(result.features[0]?.preconditions.session).toBe('signed-in');
    expect(result.features[0]?.deepLinkable).toBe(false);
    expect(result.errors).toEqual([
      'apps/extension/tests/feature-map/home.features.ts:7: feature uses a spread (...base) the parser cannot follow; write the fields out',
      "apps/extension/tests/feature-map/home.features.ts:9: field 'preconditions' uses a spread (...preconditions) the parser cannot follow; write the fields out",
    ]);
  });

  test('reports a file without an exported feature array', () => {
    const result = parseFeaturesSource(file, `const notExported = [];`, table);
    expect(result.errors).toEqual([
      'apps/extension/tests/feature-map/home.features.ts: no exported feature array found',
    ]);
  });

  test('keeps unresolved member references out of the entry', () => {
    const result = parseFeaturesSource(
      file,
      `export const f = [{ id: 'x', anchor: { kind: 'route' }, routes: [RouteUrls.Missing], params: [], entry: [], gate: 'none', flags: [],
        preconditions: { session: 'signed-in', mocks: [] }, selectors: { ready: HomePageSelectors.SellBtn, others: [] },
        actions: [], specs: [], description: 'x' }] as const;`,
      table
    );
    expect(result.features).toEqual([]);
    expect(result.errors).toEqual([
      "apps/extension/tests/feature-map/home.features.ts:1: field 'routes[0]' must be a string",
    ]);
  });
});
