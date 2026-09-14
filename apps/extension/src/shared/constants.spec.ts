import { afterEach, describe, expect, test, vi } from 'vitest';

import { isWhitelistedOrigin } from './constants';

describe(isWhitelistedOrigin.name, () => {
  test('accepts the exact whitelisted origin', () => {
    expect(isWhitelistedOrigin('https://app.leather.io')).toBe(true);
  });

  test('accepts the staging origin when not in production', () => {
    expect(
      isWhitelistedOrigin('https://dev-leather-web.wallet-6d1.workers.dev/multisig/onboarding')
    ).toBe(true);
  });

  test('rejects a localhost origin when not in development', () => {
    expect(isWhitelistedOrigin('http://localhost:3000')).toBe(false);
  });

  test('normalizes a trailing slash to the same origin', () => {
    expect(isWhitelistedOrigin('https://app.leather.io/')).toBe(true);
  });

  test('rejects an http variant of a whitelisted origin', () => {
    expect(isWhitelistedOrigin('http://app.leather.io')).toBe(false);
  });

  test('rejects a look-alike subdomain', () => {
    expect(isWhitelistedOrigin('https://app.leather.io.evil.com')).toBe(false);
  });

  test('rejects a path-prefixed look-alike', () => {
    expect(isWhitelistedOrigin('https://evil.com/app.leather.io')).toBe(false);
  });

  test('rejects undefined, null and empty origins', () => {
    expect(isWhitelistedOrigin(undefined)).toBe(false);
    expect(isWhitelistedOrigin(null)).toBe(false);
    expect(isWhitelistedOrigin('')).toBe(false);
  });

  test('rejects a value that is not a URL', () => {
    expect(isWhitelistedOrigin('not a url')).toBe(false);
  });
});

describe(`${isWhitelistedOrigin.name} in development`, () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  async function loadInDevMode() {
    vi.stubEnv('WALLET_ENVIRONMENT', 'development');
    vi.resetModules();
    return (await import('./constants')).isWhitelistedOrigin;
  }

  test('accepts any localhost origin regardless of port or scheme', async () => {
    const isWhitelisted = await loadInDevMode();
    expect(isWhitelisted('http://localhost:3000')).toBe(true);
    expect(isWhitelisted('http://localhost:8080')).toBe(true);
    expect(isWhitelisted('https://localhost')).toBe(true);
    expect(isWhitelisted('http://127.0.0.1:3000')).toBe(true);
    expect(isWhitelisted('http://[::1]:3000')).toBe(true);
  });

  test('still accepts the production whitelist', async () => {
    const isWhitelisted = await loadInDevMode();
    expect(isWhitelisted('https://app.leather.io')).toBe(true);
  });

  test('still rejects a non-localhost, non-whitelisted origin', async () => {
    const isWhitelisted = await loadInDevMode();
    expect(isWhitelisted('https://evil.com')).toBe(false);
    expect(isWhitelisted('https://localhost.evil.com')).toBe(false);
  });
});

describe(`${isWhitelistedOrigin.name} in production`, () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  async function loadInProductionMode() {
    vi.stubEnv('WALLET_ENVIRONMENT', 'production');
    vi.resetModules();
    return (await import('./constants')).isWhitelistedOrigin;
  }

  test('rejects the staging origin', async () => {
    const isWhitelisted = await loadInProductionMode();
    expect(isWhitelisted('https://dev-leather-web.wallet-6d1.workers.dev')).toBe(false);
    expect(
      isWhitelisted('https://dev-leather-web.wallet-6d1.workers.dev/multisig/onboarding')
    ).toBe(false);
  });

  test('rejects localhost origins', async () => {
    const isWhitelisted = await loadInProductionMode();
    expect(isWhitelisted('http://localhost:3000')).toBe(false);
  });

  test('still accepts the production origin', async () => {
    const isWhitelisted = await loadInProductionMode();
    expect(isWhitelisted('https://app.leather.io')).toBe(true);
  });
});
