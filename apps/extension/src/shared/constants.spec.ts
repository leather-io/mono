import { describe, expect, test } from 'vitest';

import { isWhitelistedOrigin } from './constants';

describe(isWhitelistedOrigin.name, () => {
  test('accepts the exact whitelisted origin', () => {
    expect(isWhitelistedOrigin('https://app.leather.io')).toBe(true);
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
