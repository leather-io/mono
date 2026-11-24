import { describe, expect, test } from 'vitest';

import { getStagingRedirect } from './staging-redirect';

describe('getStagingRedirect', () => {
  test('redirects the dev preview alias to staging preserving path and query', () => {
    const response = getStagingRedirect(
      new Request('https://dev-leather-web.wallet-6d1.workers.dev/staking/stake?foo=bar&baz=1')
    );
    expect(response?.status).toBe(301);
    expect(response?.headers.get('Location')).toBe(
      'https://staging.app.leather.io/staking/stake?foo=bar&baz=1'
    );
  });

  test('redirects the dev preview alias root', () => {
    const response = getStagingRedirect(
      new Request('https://dev-leather-web.wallet-6d1.workers.dev')
    );
    expect(response?.headers.get('Location')).toBe('https://staging.app.leather.io/');
  });

  test.each([
    'https://staging.app.leather.io/staking',
    'https://app.leather.io/staking',
    'https://leather-web.wallet-6d1.workers.dev/staking',
    'https://pr-2815-leather-web.wallet-6d1.workers.dev/staking',
    'https://1a2b3c4d-leather-web.wallet-6d1.workers.dev/staking',
    'http://localhost:5173/staking',
  ])('does not redirect %s', url => {
    expect(getStagingRedirect(new Request(url))).toBeNull();
  });
});
