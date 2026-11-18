import { describe, expect, test } from 'vitest';

import { getCanonicalHostRedirect } from './canonical-host-redirect';

describe('getCanonicalHostRedirect', () => {
  test.each([
    ['https://app.leather.io/staking/stake?foo=bar', 'https://leather.io/staking/stake?foo=bar'],
    ['https://app.leather.io/', 'https://leather.io/'],
    ['https://www.leather.io/apps', 'https://leather.io/apps'],
  ])('redirects %s to %s', (from, to) => {
    const response = getCanonicalHostRedirect(new Request(from));
    expect(response?.status).toBe(301);
    expect(response?.headers.get('Location')).toBe(to);
  });

  test.each([
    'https://leather.io/staking',
    'https://staging.app.leather.io/staking',
    'https://pr-2931-leather-web.wallet-6d1.workers.dev/',
    'http://localhost:5173/',
  ])('does not redirect %s', url => {
    expect(getCanonicalHostRedirect(new Request(url))).toBeNull();
  });
});
