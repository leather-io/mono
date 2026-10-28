import path from 'node:path';
import { describe, expect, test } from 'vitest';

import { getFeatureMapAppConfig } from '../feature-map/app-config.js';
import { type ParsedFeature } from '../feature-map/features-parser.js';
import { type FeatureMapModel } from '../feature-map/model.js';
import { type VerifyInputs } from '../feature-map/test-assets.js';
import {
  type ResolveContext,
  VerifyArgumentError,
  deriveAccountType,
  formatTimestamp,
  parseFlagOverrides,
  resolveVerifyRun,
  sessionFromOptions,
  slugFor,
} from './resolve.js';

const config = getFeatureMapAppConfig('extension');

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
    preconditions: { session: 'signed-in', mocks: ['setupMockApis'] },
    selectors: {
      ready: { value: 'home-page-container', ref: 'HomePageSelectors.HomePageContainer' },
      others: [],
    },
    actions: [],
    specs: [],
    description: 'Home.',
    ...overrides,
  };
}

const sendBtc = feature({
  id: 'send-btc-form',
  routes: [{ value: '/send/:symbol', ref: 'RouteUrls.SendCryptoAssetForm' }],
  params: [{ name: 'symbol', example: 'btc' }],
  flags: ['releaseOnramperBuy'],
  preconditions: {
    session: 'signed-in',
    network: 'testnet',
    mocks: ['setupMockApis', 'mockMixedUtxosForSend'],
  },
  selectors: {
    ready: { value: 'send-page-ready', ref: 'SendCryptoAssetSelectors.SendPageReady' },
    others: [],
  },
});

const welcome = feature({
  id: 'welcome',
  routes: [{ value: '/get-started', ref: 'RouteUrls.Onboarding' }],
  preconditions: { session: 'signed-out', mocks: [] },
  selectors: { ready: { value: 'sign-up-btn', ref: 'OnboardingSelectors.SignUpBtn' }, others: [] },
});

const callContract = feature({
  id: 'rpc-stx-call-contract',
  routes: [{ value: '/stx-call-contract', ref: 'RouteUrls.RpcStxCallContract' }],
  entry: [{ kind: 'rpc', method: 'stx_callContract', steps: ['Call'] }],
  selectors: {
    ready: { value: 'address-displayer', ref: 'SharedComponentsSelectors.AddressDisplayer' },
    others: [],
  },
});

const signBip322 = feature({
  ...callContract,
  id: 'rpc-sign-bip322-message',
  entry: [{ kind: 'rpc', method: 'signMessage', steps: ['Call'] }],
});

const ledgerHome = feature({
  id: 'ledger-home',
  routes: [{ value: '/', ref: 'RouteUrls.Home' }],
  preconditions: { session: 'signed-in', accountType: 'ledger', network: 'testnet4', mocks: [] },
});

const policySend = feature({
  ...ledgerHome,
  id: 'policy-send',
  preconditions: { session: 'signed-in', accountType: 'policy', mocks: [] },
});

const paperWallet = feature({
  ...ledgerHome,
  id: 'paper-wallet',
  preconditions: { session: 'signed-in', accountType: 'paper', mocks: [] },
});

const receive = feature({
  id: 'receive-dialog',
  anchor: { kind: 'selectors', objects: ['HomePageSelectors.ReceiveAssetsTab'] },
  routes: [],
  open: ['HomePage.goToReceiveDialog'],
  selectors: {
    ready: { value: 'receive-assets-tab', ref: 'HomePageSelectors.ReceiveAssetsTab' },
    others: [],
  },
});

const highFee = feature({
  id: 'high-fee-warning-sheet',
  anchor: { kind: 'selectors', objects: ['SendCryptoAssetSelectors.HighFeeWarningSheet'] },
  routes: [],
  startRoute: { value: '/send/:symbol', ref: 'RouteUrls.SendCryptoAssetForm' },
  params: [{ name: 'symbol', example: 'stx' }],
  open: [],
  selectors: {
    ready: { value: 'high-fee-warning-sheet', ref: 'SendCryptoAssetSelectors.HighFeeWarningSheet' },
    others: [],
  },
});

const switcher = feature({
  ...highFee,
  id: 'network-switcher',
  open: ['HomePage.goToReceiveDialog'],
});

const walletLock = feature({
  id: 'wallet-lock',
  anchor: { kind: 'behavior' },
  routes: [],
  selectors: { others: [] },
  specs: ['apps/extension/tests/specs/settings/wallet-lock.spec.ts'],
});

const supportedMethods = feature({
  id: 'rpc-supported-methods',
  anchor: { kind: 'rpc', handlers: ['supported-methods'] },
  routes: [],
  entry: [{ kind: 'rpc', method: 'supportedMethods', steps: [] }],
  selectors: { others: [] },
});

const flying = feature({ ...receive, id: 'flying', open: ['HomePage.fly'] });

const stateOnly = feature({
  id: 'send-btc-choose-fee',
  routes: [{ value: '/send/btc/choose-fee', ref: 'RouteUrls.SendBtcChooseFee' }],
  deepLinkable: false,
});

const model: FeatureMapModel = {
  config,
  routeUrls: new Map(),
  selectorTable: new Map(),
  router: { routes: [], references: new Map(), unresolved: [] },
  features: [
    feature({}),
    sendBtc,
    welcome,
    callContract,
    receive,
    highFee,
    switcher,
    walletLock,
    supportedMethods,
    flying,
    signBip322,
    ledgerHome,
    policySend,
    paperWallet,
    stateOnly,
  ],
  parseErrors: [],
  pageObjectActions: new Map([
    [
      'HomePage.goToReceiveDialog',
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
    ['mockStacksFeeRequests', { file: 'mock-stacks-fees.ts', line: 1 }],
    ['mockCmsRequests', { file: 'mock-cms.ts', line: 1 }],
    ['mockBnsV2NameLookup', { file: 'mock-stacks-bns.ts', line: 1 }],
  ]),
  setupMocks: undefined,
  verifyMocks: new Set([
    'setupMockApis',
    'mockUnhandledRequests',
    'mockMixedUtxosForSend',
    'mockStacksFeeRequests',
    'mockCmsRequests',
  ]),
  specs: new Map(),
  flags: ['releaseOnramperBuy', 'releaseOnramperSell', 'swapSbtcBridging'],
  rpcMethods: new Set(['getAddresses', 'stx_callContract', 'signMessage']),
  selectorObjects: new Map(),
  rpcHandlers: new Map(),
};

const inputs: VerifyInputs = {
  persistedSlices: ['accounts', 'active', 'networks', 'softwareKeys', 'wallets'],
  networkIds: ['mainnet', 'testnet', 'testnet4', 'signet'],
  rpcCatalog: new Map([
    ['getAddresses', 'getAddresses'],
    ['stx_callContract', 'stx_callContract'],
    ['stx_callContract-sip10', 'stx_callContract'],
  ]),
  verifyMocks: new Set([
    'setupMockApis',
    'mockUnhandledRequests',
    'mockMixedUtxosForSend',
    'mockStacksFeeRequests',
    'mockCmsRequests',
  ]),
};

const context: ResolveContext = {
  now: new Date('2026-10-22T19:55:03Z'),
  cwd: '/work',
  readParams(file) {
    return { file };
  },
};

describe(resolveVerifyRun.name, () => {
  test('derives route, session, flags, mocks and ready selector from a feature', () => {
    const { run, warnings } = resolveVerifyRun(
      model,
      inputs,
      { feature: 'send-btc-form' },
      context
    );
    expect(warnings).toEqual([]);
    expect(run).toEqual({
      feature: 'send-btc-form',
      route: '/send/btc',
      open: [],
      session: 'signed-in',
      accountType: 'software',
      network: 'testnet',
      connectTestApp: false,
      flags: { releaseOnramperBuy: true },
      mocksMode: 'default',
      mocks: ['setupMockApis', 'mockMixedUtxosForSend'],
      ready: 'send-page-ready',
      rpc: undefined,
      stateSlices: ['active', 'networks', 'wallets'],
      allowConsoleErrors: false,
      outDir: path.join(config.appDir, 'verify-results', 'send-btc-form-20261022-195503-000'),
      readyTimeoutMs: 30_000,
    });
  });

  test('lets explicit options override the derived values', () => {
    const { run } = resolveVerifyRun(
      model,
      inputs,
      {
        feature: 'send-btc-form',
        locked: true,
        flags: 'releaseOnramperBuy=false,swapSbtcBridging=true',
        ready: 'custom-ready',
        out: 'results/here',
        timeout: '5000',
      },
      context
    );
    expect(run.session).toBe('locked');
    expect(run.flags).toEqual({ releaseOnramperBuy: false, swapSbtcBridging: true });
    expect(run.ready).toBe('custom-ready');
    expect(run.outDir).toBe('/work/results/here');
    expect(run.readyTimeoutMs).toBe(5000);
  });

  test('resolves the mock list from the entry, none, or an explicit list', () => {
    const none = resolveVerifyRun(
      model,
      inputs,
      { feature: 'send-btc-form', mocks: 'none' },
      context
    );
    expect(none.run.mocksMode).toBe('none');
    expect(none.run.mocks).toEqual([]);
    expect(none.warnings[0]).toContain('--mocks none');
    expect(
      resolveVerifyRun(
        model,
        inputs,
        { feature: 'welcome', mocks: 'mockStacksFeeRequests, mockCmsRequests' },
        context
      ).run.mocks
    ).toEqual([
      'setupMockApis',
      'mockUnhandledRequests',
      'mockStacksFeeRequests',
      'mockCmsRequests',
    ]);
  });

  test('uses the feature session for signed-out screens', () => {
    expect(resolveVerifyRun(model, inputs, { feature: 'welcome' }, context).run.session).toBe(
      'signed-out'
    );
  });

  test('derives the account type and network from the entry and lets options override them', () => {
    const ledger = resolveVerifyRun(model, inputs, { feature: 'ledger-home' }, context);
    expect(ledger.run.accountType).toBe('ledger');
    expect(ledger.run.network).toBe('testnet4');
    expect(
      resolveVerifyRun(model, inputs, { feature: 'policy-send' }, context).run.accountType
    ).toBe('policy');
    const overridden = resolveVerifyRun(
      model,
      inputs,
      { feature: 'ledger-home', accountType: 'mixed', network: 'signet' },
      context
    );
    expect(overridden.run.accountType).toBe('mixed');
    expect(overridden.run.network).toBe('signet');
    const paper = resolveVerifyRun(model, inputs, { feature: 'paper-wallet' }, context);
    expect(paper.run.accountType).toBe('software');
    expect(paper.warnings[0]).toContain("declares accountType 'paper'");
    expect(deriveAccountType(undefined)).toBe('software');
    expect(deriveAccountType('ledger')).toBe('ledger');
    expect(deriveAccountType('policy')).toBe('policy');
    expect(deriveAccountType('Ledger (bitcoin + stacks)')).toBeUndefined();
  });

  test('rejects unknown account types, networks and a locked Ledger wallet', () => {
    function resolve(options: Parameters<typeof resolveVerifyRun>[2]) {
      return () => resolveVerifyRun(model, inputs, options, context);
    }
    expect(resolve({ feature: 'welcome', accountType: 'paper' })).toThrowError(
      /--account-type must be one of software, ledger, mixed, policy/
    );
    expect(resolve({ feature: 'welcome', network: 'moonnet' })).toThrowError(
      /--network 'moonnet' is not a wallet network id. Fix: use one of mainnet, testnet, testnet4, signet/
    );
    expect(resolve({ feature: 'ledger-home', locked: true })).toThrowError(
      /--locked needs a wallet with a password/
    );
  });

  test('connects the test app for rpc runs unless told otherwise', () => {
    expect(
      resolveVerifyRun(model, inputs, { feature: 'rpc-stx-call-contract' }, context).run
        .connectTestApp
    ).toBe(true);
    expect(
      resolveVerifyRun(model, inputs, { feature: 'home-tokens' }, context).run.connectTestApp
    ).toBe(false);
    expect(
      resolveVerifyRun(model, inputs, { feature: 'home-tokens', connectTestApp: true }, context).run
        .connectTestApp
    ).toBe(true);
    expect(
      resolveVerifyRun(
        model,
        inputs,
        { feature: 'rpc-stx-call-contract', connectTestApp: false },
        context
      ).run.connectTestApp
    ).toBe(false);
  });

  test('selects state slices from --state and validates them against the persist whitelist', () => {
    expect(
      resolveVerifyRun(model, inputs, { feature: 'home-tokens' }, context).run.stateSlices
    ).toEqual(['active', 'networks', 'wallets']);
    expect(
      resolveVerifyRun(model, inputs, { feature: 'home-tokens', state: 'all' }, context).run
        .stateSlices
    ).toEqual(['accounts', 'active', 'networks', 'softwareKeys', 'wallets']);
    expect(
      resolveVerifyRun(
        model,
        inputs,
        { feature: 'home-tokens', state: 'wallets, softwareKeys' },
        context
      ).run.stateSlices
    ).toEqual(['wallets', 'softwareKeys']);
    expect(() =>
      resolveVerifyRun(model, inputs, { feature: 'home-tokens', state: 'secrets' }, context)
    ).toThrowError(/--state names unknown slice 'secrets'/);
    expect(
      resolveVerifyRun(model, inputs, { feature: 'home-tokens', allowConsoleErrors: true }, context)
        .run.allowConsoleErrors
    ).toBe(true);
  });

  test('resolves rpc params from the catalog, a file, or a bare method', () => {
    const plain = resolveVerifyRun(model, inputs, { feature: 'rpc-stx-call-contract' }, context);
    expect(plain.run.rpc).toEqual({ method: 'stx_callContract', catalogId: 'stx_callContract' });
    expect(
      resolveVerifyRun(
        model,
        inputs,
        { feature: 'welcome', rpc: 'catalog:stx_callContract-sip10' },
        context
      ).run.rpc
    ).toEqual({ method: 'stx_callContract', catalogId: 'stx_callContract-sip10' });
    expect(
      resolveVerifyRun(model, inputs, { feature: 'welcome', rpc: 'getAddresses' }, context).run.rpc
    ).toEqual({ method: 'getAddresses' });
    expect(() =>
      resolveVerifyRun(model, inputs, { feature: 'welcome', rpc: 'catalog:nope' }, context)
    ).toThrowError(
      /unknown catalog id 'nope'. Fix: use one of getAddresses, stx_callContract, stx_callContract-sip10/
    );
    expect(() =>
      resolveVerifyRun(
        model,
        inputs,
        { feature: 'welcome', rpc: 'catalog:getAddresses', params: './x.json' },
        context
      )
    ).toThrowError(/--params only applies to --rpc <method>/);
    expect(() =>
      resolveVerifyRun(model, inputs, { feature: 'rpc-sign-bip322-message' }, context)
    ).toThrowError(
      /calls 'signMessage' but no catalog spec in apps\/test-app\/src\/methods builds its params. Fix: pass --params <file.json>, or add a catalog spec for it. Catalog methods: getAddresses \(getAddresses\); stx_callContract \(stx_callContract, stx_callContract-sip10\)/
    );
  });

  test('defaults --rpc to the entry method and reads --params from a file', () => {
    const withParams = resolveVerifyRun(
      model,
      inputs,
      { feature: 'rpc-stx-call-contract', params: './req.json' },
      context
    );
    expect(withParams.run.rpc).toEqual({
      method: 'stx_callContract',
      params: { file: '/work/req.json' },
    });

    const bare = resolveVerifyRun(
      model,
      inputs,
      { feature: 'rpc-stx-call-contract', rpc: 'getAddresses' },
      context
    );
    expect(bare.run.rpc).toEqual({ method: 'getAddresses' });
  });

  test('substitutes :param and {template} segments from the entry params', () => {
    const swap = feature({
      id: 'swap-form',
      routes: [{ value: '/swap/{chain}/:base/:quote?', ref: 'RouteUrls.Swap' }],
      params: [
        { name: 'chain', example: 'stacks' },
        { name: 'base', example: 'STX' },
        { name: 'quote', example: 'aeUSDC' },
      ],
    });
    const { run } = resolveVerifyRun(
      { ...model, features: [...model.features, swap] },
      inputs,
      { feature: 'swap-form' },
      context
    );
    expect(run.route).toBe('/swap/stacks/STX/aeUSDC');
    const token = feature({
      id: 'token-details',
      routes: [{ value: '/token/*', ref: 'RouteUrls.TokenDetails' }],
      params: [{ name: '*', example: 'BTC' }],
    });
    expect(
      resolveVerifyRun(
        { ...model, features: [...model.features, token] },
        inputs,
        { feature: 'token-details' },
        context
      ).run.route
    ).toBe('/token/BTC');
  });

  test('resolves a selectors entry to its start route and open actions', () => {
    const { run } = resolveVerifyRun(model, inputs, { feature: 'receive-dialog' }, context);
    expect(run.route).toBe('/');
    expect(run.open).toEqual(['HomePage.goToReceiveDialog']);
    expect(run.ready).toBe('receive-assets-tab');
    expect(run.outDir).toBe(
      path.join(config.appDir, 'verify-results', 'receive-dialog-20261022-195503-000')
    );
    expect(
      resolveVerifyRun(model, inputs, { feature: 'network-switcher' }, context).run.route
    ).toBe('/send/stx');
  });

  test('refuses entries verify cannot open, pointing at their specs', () => {
    function resolve(feature: string) {
      return () => resolveVerifyRun(model, inputs, { feature }, context);
    }
    expect(resolve('wallet-lock')).toThrowError(VerifyArgumentError);
    expect(resolve('wallet-lock')).toThrowError(
      /'wallet-lock' is a behavior with no screen to open; reproduce it with its specs. Specs: apps\/extension\/tests\/specs\/settings\/wallet-lock.spec.ts/
    );
    expect(resolve('high-fee-warning-sheet')).toThrowError(/has no open action/);
    expect(resolve('send-btc-choose-fee')).toThrowError(
      /'send-btc-choose-fee' is not deep-linkable: the screen reads router state/
    );
    expect(resolve('rpc-supported-methods')).toThrowError(/declares no selectors.ready/);
    expect(resolve('flying')).toThrowError(
      /open action 'HomePage.fly' is not a public page-object method/
    );
  });

  test('resolves a bare route with a warning when no ready selector is given', () => {
    const { run, warnings } = resolveVerifyRun(
      model,
      inputs,
      { route: '/sell', signedOut: true },
      context
    );
    expect(run.route).toBe('/sell');
    expect(run.session).toBe('signed-out');
    expect(run.ready).toBeUndefined();
    expect(run.mocks).toEqual(['setupMockApis', 'mockUnhandledRequests']);
    expect(run.outDir).toBe(path.join(config.appDir, 'verify-results', 'sell-20261022-195503-000'));
    expect(warnings[0]).toContain('--route without --ready');
  });

  test('rejects bad argument combinations with a fix', () => {
    function resolve(options: Parameters<typeof resolveVerifyRun>[2]) {
      return () => resolveVerifyRun(model, inputs, options, context);
    }
    expect(resolve({})).toThrowError(VerifyArgumentError);
    expect(resolve({})).toThrowError(/pass --feature <id> or --route <path>/);
    expect(resolve({ feature: 'nope' })).toThrowError(
      /unknown feature 'nope'. Fix: use one of home-tokens/
    );
    expect(resolve({ feature: 'welcome', route: '/x' })).toThrowError(/mutually exclusive/);
    expect(resolve({ route: 'sell' })).toThrowError(/--route must start with '\/'/);
    expect(resolve({ feature: 'welcome', mocks: 'mockNothing' })).toThrowError(
      /--mocks names unknown mock 'mockNothing'/
    );
    expect(resolve({ feature: 'welcome', mocks: 'mockBnsV2NameLookup' })).toThrowError(
      /--mocks names 'mockBnsV2NameLookup', which is exported but not registered/
    );
    const unregistered = feature({
      id: 'cms-banner',
      preconditions: { session: 'signed-in', mocks: ['setupMockApis', 'mockBnsV2NameLookup'] },
    });
    expect(() =>
      resolveVerifyRun(
        { ...model, features: [...model.features, unregistered] },
        inputs,
        { feature: 'cms-banner' },
        context
      )
    ).toThrowError(
      /feature 'cms-banner' lists mocks the verify registry cannot apply: mockBnsV2NameLookup/
    );
    expect(resolve({ feature: 'welcome', params: './x.json' })).toThrowError(
      /--params needs --rpc/
    );
    expect(resolve({ feature: 'welcome', signedIn: true, locked: true })).toThrowError(
      /mutually exclusive/
    );
    expect(resolve({ feature: 'welcome', timeout: 'soon' })).toThrowError(
      /--timeout must be a positive number/
    );
  });
});

describe(parseFlagOverrides.name, () => {
  const known = ['releaseOnramperBuy', 'swapSbtcBridging'];

  test('parses name=true|false pairs', () => {
    expect(parseFlagOverrides('releaseOnramperBuy=true, swapSbtcBridging=false', known)).toEqual({
      releaseOnramperBuy: true,
      swapSbtcBridging: false,
    });
    expect(parseFlagOverrides(undefined, known)).toEqual({});
  });

  test('rejects malformed pairs and unknown flags', () => {
    expect(() => parseFlagOverrides('releaseOnramperBuy', known)).toThrowError(
      /name=true\|false pairs/
    );
    expect(() => parseFlagOverrides('releaseOnramperBuy=yes', known)).toThrowError(
      /name=true\|false pairs/
    );
    expect(() => parseFlagOverrides('releaseTeleport=true', known)).toThrowError(
      /unknown flag 'releaseTeleport'. Fix: use one of releaseOnramperBuy, swapSbtcBridging/
    );
  });
});

describe(sessionFromOptions.name, () => {
  test('maps the session switches', () => {
    expect(sessionFromOptions({})).toBeUndefined();
    expect(sessionFromOptions({ signedIn: true })).toBe('signed-in');
    expect(sessionFromOptions({ signedOut: true })).toBe('signed-out');
    expect(sessionFromOptions({ locked: true })).toBe('locked');
  });
});

describe(slugFor.name, () => {
  test('prefers the feature id and slugs a route otherwise', () => {
    expect(slugFor('home-tokens', '/')).toBe('home-tokens');
    expect(slugFor(undefined, '/send/btc')).toBe('send-btc');
    expect(slugFor(undefined, '/all-balances/:category')).toBe('all-balances-category');
    expect(slugFor(undefined, '/')).toBe('root');
  });
});

describe(formatTimestamp.name, () => {
  test('formats UTC as YYYYMMDD-HHMMSS', () => {
    expect(formatTimestamp(new Date('2026-01-05T03:04:09Z'))).toBe('20260105-030409-000');
  });
});
