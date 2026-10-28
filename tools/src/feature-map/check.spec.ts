import path from 'node:path';
import { describe, expect, test } from 'vitest';

import { getFeatureMapAppConfig } from './app-config.js';
import { checkFeatureMap, formatCheckReport } from './check.js';
import { type ParsedFeature } from './features-parser.js';
import { type FeatureMapModel } from './model.js';
import { type RoutedRoute } from './routers-parser.js';
import { type RpcHandler, type SelectorObject } from './test-assets.js';

const config = getFeatureMapAppConfig('extension');
const appRoutes = path.join(config.appDir, 'src/app/routes/app-routes.tsx');
const sendRoutes = path.join(config.appDir, 'src/app/pages/send/send.routes.tsx');
const mocksDir = config.mocksDir ?? '';
const rpcMethodsDir = config.rpcMethodsDir ?? '';
const mockApis = path.join(mocksDir, 'mock-apis.ts');

function route(overrides: Partial<RoutedRoute>): RoutedRoute {
  return {
    file: appRoutes,
    line: 1,
    keys: [],
    path: '',
    mountedPath: '',
    gates: [],
    flags: [],
    parentKeys: [],
    isIndex: false,
    ...overrides,
  };
}

function feature(overrides: Partial<ParsedFeature>): ParsedFeature {
  return {
    file: path.join(config.featuresDir, 'home.features.ts'),
    line: 1,
    group: 'home',
    id: 'home-tokens',
    anchor: { kind: 'route' },
    routes: [{ value: '/', ref: 'RouteUrls.Home' }],
    open: [],
    deepLinkable: true,
    params: [],
    entry: [{ kind: 'nav', steps: ['Open'] }],
    gate: 'account',
    flags: [],
    preconditions: { session: 'signed-in', mocks: [] },
    selectors: { ready: { value: 'home', ref: 'HomePageSelectors.Home' }, others: [] },
    actions: [],
    specs: [],
    description: 'Home.',
    ...overrides,
  };
}

const routes: RoutedRoute[] = [
  route({ keys: ['Home'], path: '/', mountedPath: '/', gates: ['account'] }),
  route({
    keys: ['Sell'],
    path: '/sell',
    mountedPath: '/sell',
    gates: ['account'],
    flags: ['releaseOnramperSell'],
    line: 7,
  }),
  route({
    file: sendRoutes,
    keys: ['SendForm'],
    path: '/send/btc',
    mountedPath: '/send/btc',
    line: 3,
  }),
  route({
    file: sendRoutes,
    keys: ['SendForm'],
    path: '/send/stx',
    mountedPath: '/send/stx',
    line: 4,
  }),
  route({
    file: sendRoutes,
    keys: ['EditNonce'],
    path: 'edit-tx-nonce',
    mountedPath: '/send/stx/edit-tx-nonce',
    parentKeys: ['SendForm'],
    line: 5,
  }),
  route({
    keys: ['RpcTransfer'],
    path: '/stx-transfer',
    mountedPath: '/stx-transfer',
    gates: ['account', 'ledgerStacks'],
    line: 11,
  }),
  route({
    keys: ['TokenDetails'],
    path: '/token/*',
    mountedPath: '/token/*',
    gates: ['account'],
    line: 12,
  }),
];

const homeTokens = feature({});
const sellEntry = feature({
  id: 'sell',
  flags: ['releaseOnramperSell'],
  routes: [{ value: '/sell', ref: 'RouteUrls.Sell' }],
});
const sendEntry = feature({
  id: 'send-form',
  gate: 'none',
  routes: [
    { value: '/send/:symbol', ref: 'RouteUrls.SendForm' },
    { value: 'edit-tx-nonce', ref: 'RouteUrls.EditNonce' },
  ],
});
const sendOnlyEntry = feature({
  id: 'send-form',
  gate: 'none',
  routes: [{ value: '/send/:symbol', ref: 'RouteUrls.SendForm' }],
});
const rpcTransferEntry = feature({
  id: 'rpc-transfer',
  gate: 'ledgerStacks',
  routes: [{ value: '/stx-transfer', ref: 'RouteUrls.RpcTransfer' }],
});
const tokenDetailsEntry = feature({
  id: 'token-details',
  routes: [{ value: '/token/*', ref: 'RouteUrls.TokenDetails' }],
});
const claimers = [homeTokens, sellEntry, sendEntry, rpcTransferEntry, tokenDetailsEntry];

function claimersExcept(...ids: string[]): ParsedFeature[] {
  return claimers.filter(entry => !ids.includes(entry.id));
}

function model(overrides: Partial<FeatureMapModel>): FeatureMapModel {
  return {
    config,
    routeUrls: new Map([
      ['Home', '/'],
      ['Sell', '/sell'],
      ['SendForm', '/send/:symbol'],
      ['EditNonce', 'edit-tx-nonce'],
      ['Unrouted', '/unrouted'],
      ['RpcTransfer', '/stx-transfer'],
      ['TokenDetails', '/token/*'],
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
    features: claimers,
    parseErrors: [],
    pageObjectActions: new Map([
      [
        'HomePage.lock',
        {
          file: 'home.page.ts',
          line: 1,
          className: 'HomePage',
          requiredParameters: 0,
          isStatic: false,
        },
      ],
    ]),
    mocks: new Map([
      ['setupMockApis', { file: mockApis, line: 1 }],
      ['mockStacksFeeRequests', { file: 'mock-stacks-fees.ts', line: 1 }],
    ]),
    setupMocks: {
      name: 'setupMockApis',
      file: mockApis,
      line: 1,
      members: ['mockStacksFeeRequests'],
    },
    specs: new Map([
      [
        'apps/extension/tests/specs/onboarding/onboarding.spec.ts',
        {
          path: 'apps/extension/tests/specs/onboarding/onboarding.spec.ts',
          texts: [],
          routeKeys: [],
        },
      ],
    ]),
    flags: ['releaseOnramperSell'],
    rpcMethods: new Set(['open']),
    selectorObjects: new Map(),
    rpcHandlers: new Map(),
    ...overrides,
  };
}

describe(checkFeatureMap.name, () => {
  test('passes when every routed key is claimed', () => {
    const result = checkFeatureMap(model({}));
    expect(result.errors).toEqual([]);
    expect(formatCheckReport(model({}), result)).toBe(
      'feature-map: ok (5 features in apps/extension)'
    );
  });

  test('reports an unclaimed routed key with the fix', () => {
    const result = checkFeatureMap(model({ features: claimersExcept('sell') }));
    expect(result.errors).toEqual([
      [
        "route RouteUrls.Sell ('/sell') is routed in apps/extension/src/app/routes/app-routes.tsx:7",
        'but no entry in apps/extension/tests/feature-map/*.features.ts claims it.',
        "Fix: add an entry with anchor { kind: 'route' } and routes: [RouteUrls.Sell] to apps/extension/tests/feature-map/<group>.features.ts; copy the nearest entry as a starting point.",
      ].join('\n'),
    ]);
  });

  test('points nested-only keys at the parent entry instead of a new entry', () => {
    const result = checkFeatureMap(
      model({ features: [...claimersExcept('send-form'), sendOnlyEntry] })
    );
    expect(result.errors[0]).toContain(
      'It is nested under RouteUrls.SendForm: add it to the routes of the entry that claims the parent.'
    );
  });

  test('allows one claim per mounted path and rejects more', () => {
    const btc = feature({
      id: 'send-btc',
      gate: 'none',
      routes: [
        { value: '/send/:symbol', ref: 'RouteUrls.SendForm' },
        { value: 'edit-tx-nonce', ref: 'RouteUrls.EditNonce' },
      ],
    });
    const stx = feature({
      id: 'send-stx',
      gate: 'none',
      routes: [{ value: '/send/:symbol', ref: 'RouteUrls.SendForm' }],
    });
    const sip10 = feature({
      id: 'send-sip10',
      gate: 'none',
      routes: [{ value: '/send/:symbol', ref: 'RouteUrls.SendForm' }],
    });
    const twoClaims = model({ features: [...claimersExcept('send-form'), btc, stx] });
    expect(checkFeatureMap(twoClaims).errors).toEqual([]);

    const threeClaims = model({ features: [...claimersExcept('send-form'), btc, stx, sip10] });
    expect(checkFeatureMap(threeClaims).errors).toEqual([
      [
        'route RouteUrls.SendForm is claimed by 3 entries (send-btc, send-stx, send-sip10)',
        "but routers mount it at 2 paths ('/send/btc', '/send/stx').",
        'Fix: keep it in one entry per mounted path; a nested sheet belongs to the entry whose route mounts it.',
      ].join('\n'),
    ]);
  });

  test('reports an authored gate that disagrees with the router', () => {
    const sell = feature({
      id: 'sell',
      gate: 'none',
      flags: ['releaseOnramperSell'],
      routes: [{ value: '/sell', ref: 'RouteUrls.Sell' }],
    });
    const result = checkFeatureMap(model({ features: [...claimersExcept('sell'), sell] }));
    expect(result.errors).toEqual([
      "entry 'sell' (apps/extension/tests/feature-map/home.features.ts:1): gate 'none' does not match the router: RouteUrls.Sell mounts at '/sell' behind account (apps/extension/src/app/routes/app-routes.tsx:7). Fix: set gate to 'account' or split the entry so each one has a single gate.",
    ]);
  });

  test('reports broken spec, action, mock, method and flag references', () => {
    const broken = feature({
      specs: ['apps/extension/tests/specs/missing.spec.ts'],
      actions: ['HomePage.fly'],
      preconditions: { session: 'signed-in', mocks: ['mockNothing'] },
      entry: [{ kind: 'rpc', steps: ['Call'], method: 'teleport' }],
      flags: ['releaseTeleport'],
    });
    const result = checkFeatureMap(model({ features: [...claimersExcept('home-tokens'), broken] }));
    const label = "entry 'home-tokens' (apps/extension/tests/feature-map/home.features.ts:1)";
    expect(result.errors).toEqual([
      `${label}: spec 'apps/extension/tests/specs/missing.spec.ts' does not exist. Fix: point it at a *.spec.ts under apps/extension/tests/specs or remove it.`,
      `${label}: action 'HomePage.fly' is not a public page-object method. Methods of HomePage: lock. Fix: use an existing method or add one to the page object.`,
      `${label}: mock 'mockNothing' is not exported from apps/extension/tests/mocks. Fix: use an exported mock function name or add the mock.`,
      `${label}: entry[0].method 'teleport' is not an RPC method defined in packages/rpc/src/methods. Fix: use the 'method' string of a defineRpcEndpoint call.`,
      `${label}: flag 'releaseTeleport' is not a key of FeatureFlags in apps/extension/src/app/features/feature-flags/index.tsx. Fix: use one of releaseOnramperSell.`,
    ]);
  });

  test('rejects a mock that setupMockApis already registers', () => {
    const redundant = feature({
      preconditions: { session: 'signed-in', mocks: ['setupMockApis', 'mockStacksFeeRequests'] },
    });
    const result = checkFeatureMap(
      model({ features: [...claimersExcept('home-tokens'), redundant] })
    );
    expect(result.errors).toEqual([
      "entry 'home-tokens' (apps/extension/tests/feature-map/home.features.ts:1): mock 'mockStacksFeeRequests' is already registered by setupMockApis (apps/extension/tests/mocks/mock-apis.ts:1). Fix: remove it from mocks; name it in the description if the screen depends on it.",
    ]);
    const alone = feature({
      preconditions: { session: 'signed-in', mocks: ['mockStacksFeeRequests'] },
    });
    expect(
      checkFeatureMap(model({ features: [...claimersExcept('home-tokens'), alone] })).errors
    ).toEqual([]);
  });

  test('rejects routes that are not RouteUrls values and selectors that are not member references', () => {
    const broken = feature({
      routes: [{ value: '/nowhere' }],
      selectors: { ready: { value: 'raw-id' }, others: [] },
    });
    const result = checkFeatureMap(model({ features: [...claimersExcept('home-tokens'), broken] }));
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining("route '/nowhere' is not a RouteUrls value"),
        expect.stringContaining("selectors.ready 'raw-id' must reference a *Selectors member"),
      ])
    );
  });

  test('surfaces parse errors, duplicate ids and unresolved router paths', () => {
    const result = checkFeatureMap(
      model({
        parseErrors: ['home.features.ts:3: missing field description'],
        features: [...claimersExcept('home-tokens'), feature({}), feature({ line: 40 })],
        router: {
          routes,
          references: new Map(),
          unresolved: [{ file: appRoutes, line: 9, text: 'computePath()' }],
        },
      })
    );
    expect(result.errors[0]).toBe('home.features.ts:3: missing field description');
    expect(result.errors[1]).toContain(
      'router path expression at apps/extension/src/app/routes/app-routes.tsx:9 could not be resolved: computePath()'
    );
    expect(result.errors[2]).toContain("id 'home-tokens' is already used by");
  });
});

function selectorObject(name: string, fileName: string, members: string[]): SelectorObject {
  return { name, file: path.join(config.selectorsDir, fileName), line: 1, members };
}

function rpcHandler(name: string, methods: string[]): RpcHandler {
  return { name, file: path.join(rpcMethodsDir, `${name}.ts`), line: 1, methods };
}

const selectorObjects = new Map([
  [
    'HomePageSelectors',
    selectorObject('HomePageSelectors', 'home.selectors.ts', ['Home', 'ReceiveBtn']),
  ],
  [
    'UpdateAvailableSelectors',
    selectorObject('UpdateAvailableSelectors', 'update-available.selectors.ts', ['Callout']),
  ],
]);
const rpcHandlers = new Map([
  ['open', rpcHandler('open', ['open'])],
  ['supported-methods', rpcHandler('supported-methods', ['supportedMethods'])],
]);
const rpcMethods = new Set(['open', 'supportedMethods']);
const callout = feature({
  id: 'update-callout',
  anchor: { kind: 'selectors', objects: ['UpdateAvailableSelectors'] },
  routes: [],
  open: [],
  selectors: { ready: { value: 'callout', ref: 'UpdateAvailableSelectors.Callout' }, others: [] },
});
const supported = feature({
  id: 'rpc-supported-methods',
  anchor: { kind: 'rpc', handlers: ['supported-methods'] },
  routes: [],
  entry: [{ kind: 'rpc', method: 'supportedMethods', steps: [] }],
  selectors: { others: [] },
});
const openPopup = feature({
  id: 'rpc-open',
  flags: ['releaseOnramperSell'],
  routes: [{ value: '/sell', ref: 'RouteUrls.Sell' }],
  entry: [{ kind: 'rpc', method: 'open', steps: [] }],
  selectors: {
    ready: { value: 'home', ref: 'HomePageSelectors.Home' },
    others: [{ value: 'receive', ref: 'HomePageSelectors.ReceiveBtn' }],
  },
});

describe('rpc handler coverage', () => {
  test('reports unclaimed handlers but not unreferenced selector objects', () => {
    const result = checkFeatureMap(model({ selectorObjects, rpcHandlers, rpcMethods }));
    expect(result.errors).toEqual([
      expect.stringContaining(
        'rpc handler open (apps/extension/src/background/messaging/rpc-methods/open.ts, open) is claimed by no entry'
      ),
      expect.stringContaining('rpc handler supported-methods ('),
    ]);
    expect(result.errors[0]).toContain(
      "Fix: add an entry with anchor { kind: 'rpc', handlers: ['open'] } for a method without a popup"
    );
  });

  test('an rpc anchor or a routed entry method claims the handler', () => {
    const covered = model({
      selectorObjects,
      rpcHandlers,
      rpcMethods,
      features: [...claimersExcept('sell'), callout, supported, openPopup],
    });
    const result = checkFeatureMap(covered);
    expect(result.errors).toEqual([]);
    expect(formatCheckReport(covered, result)).toBe(
      'feature-map: ok (7 features in apps/extension)'
    );
  });

  test('validates anchors, open actions, startRoute and the ready selector', () => {
    const brokenSelectors = feature({
      anchor: { kind: 'selectors', objects: ['NopeSelectors', 'HomePageSelectors.Missing'] },
      open: ['HomePage.fly'],
      startRoute: { value: '/nowhere' },
      selectors: { others: [] },
    });
    const brokenRpc = feature({
      id: 'rpc-nope',
      anchor: { kind: 'rpc', handlers: ['nope'] },
      routes: [],
      selectors: { others: [] },
    });
    const emptyRoute = feature({ id: 'empty', routes: [], selectors: { others: [] } });
    const result = checkFeatureMap(
      model({
        selectorObjects,
        rpcHandlers,
        rpcMethods,
        features: [
          ...claimersExcept('home-tokens', 'sell'),
          brokenSelectors,
          brokenRpc,
          emptyRoute,
          supported,
          openPopup,
        ],
      })
    );
    expect(result.errors).toEqual([
      expect.stringContaining("anchor 'selectors' must not list routes"),
      expect.stringContaining(
        "anchor object 'NopeSelectors' is not an exported *Selectors object or member in apps/extension/tests/selectors. Fix: use one of HomePageSelectors, UpdateAvailableSelectors."
      ),
      expect.stringContaining("anchor object 'HomePageSelectors.Missing' is not an exported"),
      expect.stringContaining("startRoute '/nowhere' is not a RouteUrls value"),
      expect.stringContaining('selectors.ready is required for a selectors anchor'),
      expect.stringContaining(
        "open action 'HomePage.fly' is not a public page-object method. Methods of HomePage: lock."
      ),
      expect.stringContaining(
        "anchor handler 'nope' is not a file in apps/extension/src/background/messaging/rpc-methods. Fix: use one of open, supported-methods."
      ),
      expect.stringContaining('a route anchor needs at least one RouteUrls value in routes'),
      expect.stringContaining('selectors.ready is required for a route anchor'),
    ]);
  });

  test('skips the gate check for behaviors', () => {
    const behavior = feature({
      id: 'wallet-lock',
      anchor: { kind: 'behavior' },
      routes: [],
      gate: 'none',
      selectors: { others: [] },
    });
    const result = checkFeatureMap(
      model({
        selectorObjects,
        rpcHandlers,
        rpcMethods,
        features: [...claimersExcept('sell'), behavior, callout, supported, openPopup],
      })
    );
    expect(result.errors).toEqual([]);
  });
});

describe('router flags and orphan sheets', () => {
  test('requires an entry to list every flag its routes are mounted behind', () => {
    const sell = feature({ id: 'sell', routes: [{ value: '/sell', ref: 'RouteUrls.Sell' }] });
    const result = checkFeatureMap(model({ features: [...claimersExcept('sell'), sell] }));
    expect(result.errors).toEqual([
      "entry 'sell' (apps/extension/tests/feature-map/home.features.ts:1): RouteUrls.Sell is mounted behind the releaseOnramperSell flag (apps/extension/src/app/routes/app-routes.tsx:7) but flags does not list it. Fix: add 'releaseOnramperSell' to flags so verify turns it on.",
    ]);
  });

  test('rejects a nested sheet claimed by an entry whose routes do not mount it', () => {
    const orphan = feature({
      id: 'orphan',
      routes: [
        { value: '/', ref: 'RouteUrls.Home' },
        { value: 'edit-tx-nonce', ref: 'RouteUrls.EditNonce' },
      ],
    });
    const result = checkFeatureMap(
      model({ features: [...claimersExcept('home-tokens', 'send-form'), sendOnlyEntry, orphan] })
    );
    expect(result.errors).toEqual([
      "entry 'orphan' (apps/extension/tests/feature-map/home.features.ts:1): route 'edit-tx-nonce' is not mounted under any of this entry's routes; it only nests under other screens. Fix: move it to the entry whose route mounts it.",
    ]);
  });
});
