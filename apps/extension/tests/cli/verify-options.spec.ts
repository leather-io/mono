import { VerifyUsageError } from './verify-errors';
import {
  parseRouteParams,
  parseShotMode,
  parseStateSlices,
  parseVerifyOptions,
  routeSlug,
  substituteRouteParams,
} from './verify-options';

const optionsContext = { extensionRoot: '/ext', now: new Date('2026-10-22T10:00:00.000Z') };

describe('parseVerifyOptions', () => {
  test('applies the defaults around the required ready target', () => {
    const plan = parseVerifyOptions(
      { ready: 'HomePageSelectors.HomePageContainer' },
      optionsContext
    );
    expect(plan).toEqual({
      route: '/',
      session: 'signed-in',
      network: 'mainnet',
      ready: { target: 'HomePageSelectors.HomePageContainer', testId: 'home-page-container' },
      shot: { kind: 'viewport' },
      consoleLevel: 'all',
      allowConsoleErrors: false,
      stateSlices: ['active', 'networks', 'wallets'],
      outDir: '/ext/.verify/2026-10-22T10-00-00-000Z-root',
      build: true,
      timeoutMs: 15_000,
    });
  });

  test('substitutes route params and names the output directory after the route', () => {
    const plan = parseVerifyOptions(
      { ready: 'send-page-ready', route: '/send/:symbol', param: ['symbol=btc'] },
      optionsContext
    );
    expect(plan.route).toBe('/send/btc');
    expect(plan.outDir).toBe('/ext/.verify/2026-10-22T10-00-00-000Z-send-btc');
  });

  test('keeps an explicit output directory and coerces the timeout', () => {
    const plan = parseVerifyOptions(
      { ready: 'send-page-ready', out: '/evidence/run', timeout: '3000', build: false },
      optionsContext
    );
    expect(plan).toMatchObject({ outDir: '/evidence/run', timeoutMs: 3000, build: false });
  });

  test('rejects a missing ready target', () => {
    expect(() => parseVerifyOptions({}, optionsContext)).toThrow(VerifyUsageError);
  });

  test('rejects an unknown session mode', () => {
    expect(() => parseVerifyOptions({ ready: 'x', session: 'guest' }, optionsContext)).toThrow(
      VerifyUsageError
    );
  });

  test('rejects a non-positive timeout', () => {
    expect(() => parseVerifyOptions({ ready: 'x', timeout: '0' }, optionsContext)).toThrow(
      VerifyUsageError
    );
  });
});

describe('parseRouteParams', () => {
  test('splits on the first equals sign only', () => {
    expect(parseRouteParams(['txid=ab=cd', 'symbol=btc'])).toEqual(
      new Map([
        ['txid', 'ab=cd'],
        ['symbol', 'btc'],
      ])
    );
  });

  test('rejects a pair without a name', () => {
    expect(() => parseRouteParams(['=btc'])).toThrow(VerifyUsageError);
  });
});

describe('substituteRouteParams', () => {
  test('replaces required and optional params', () => {
    const params = new Map([['chain', 'bitcoin']]);
    expect(substituteRouteParams('/fund/:chain?', params)).toBe('/fund/bitcoin');
  });

  test('rejects a route with an unsubstituted param', () => {
    expect(() => substituteRouteParams('/increase-fee/stacks/:txid', new Map())).toThrow(/:txid/);
  });

  test('rejects a param the route does not declare', () => {
    expect(() => substituteRouteParams('/send/btc', new Map([['symbol', 'btc']]))).toThrow(
      VerifyUsageError
    );
  });
});

describe('parseShotMode', () => {
  test('parses the plain modes', () => {
    expect(['viewport', 'full', 'none'].map(parseShotMode)).toEqual([
      { kind: 'viewport' },
      { kind: 'full' },
      { kind: 'none' },
    ]);
  });

  test('parses an element screenshot by test id', () => {
    expect(parseShotMode('testid:send-form')).toEqual({ kind: 'testid', testId: 'send-form' });
  });

  test('rejects an empty test id and unknown modes', () => {
    expect(() => parseShotMode('testid:')).toThrow(VerifyUsageError);
    expect(() => parseShotMode('window')).toThrow(VerifyUsageError);
  });
});

describe('parseStateSlices', () => {
  test('expands all to every persisted slice', () => {
    expect(parseStateSlices('all')).toContain('softwareKeys');
    expect(parseStateSlices('all')).toHaveLength(11);
  });

  test('trims a comma-separated list', () => {
    expect(parseStateSlices('active, wallets')).toEqual(['active', 'wallets']);
  });

  test('rejects unknown slices and an empty list', () => {
    expect(() => parseStateSlices('session')).toThrow(VerifyUsageError);
    expect(() => parseStateSlices(',')).toThrow(VerifyUsageError);
  });
});

describe('routeSlug', () => {
  test('falls back to root for the index route', () => {
    expect(routeSlug('/')).toBe('root');
  });

  test('turns path separators into dashes', () => {
    expect(routeSlug('/send/btc/choose-fee')).toBe('send-btc-choose-fee');
  });
});
