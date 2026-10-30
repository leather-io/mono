import { describe, expect, test } from 'vitest';

import { routeSupportsNetwork } from './network-support';

describe('routeSupportsNetwork', () => {
  test('supports every route on mainnet', () => {
    expect(routeSupportsNetwork('/staking', 'mainnet')).toBe(true);
  });

  test.each([
    '/',
    '/apps',
    '/developers',
    '/news',
    '/explorer',
    '/posts',
    '/posts/what-is-stacks',
    '/support',
    '/support/send-stx',
    '/changelog',
    '/changelog/some-entry',
    '/multisig',
    '/multisig/vault',
  ])('supports %s on testnet', pathname => {
    expect(routeSupportsNetwork(pathname, 'testnet')).toBe(true);
  });

  test.each(['/staking', '/portfolio', '/sbtc', '/postsx', '/apps-old'])(
    'gates %s on testnet',
    pathname => {
      expect(routeSupportsNetwork(pathname, 'testnet')).toBe(false);
    }
  );
});
