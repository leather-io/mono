import { describe, expect, test } from 'vitest';

import { getPolicyApprovalMode } from './policy-match';

const whitelistedOrigin = 'https://app.leather.io';
const otherOrigin = 'https://evil.example.com';

describe(getPolicyApprovalMode.name, () => {
  test('returns add when both frame and top origins are whitelisted', () => {
    expect(getPolicyApprovalMode(whitelistedOrigin, whitelistedOrigin)).toBe('add');
  });

  test('returns verify when a whitelisted origin is embedded in a non-whitelisted page', () => {
    expect(getPolicyApprovalMode(whitelistedOrigin, otherOrigin)).toBe('verify');
  });

  test('returns verify when a non-whitelisted origin is embedded in a whitelisted page', () => {
    expect(getPolicyApprovalMode(otherOrigin, whitelistedOrigin)).toBe('verify');
  });

  test('returns verify when the top origin is unknown', () => {
    expect(getPolicyApprovalMode(whitelistedOrigin, null)).toBe('verify');
    expect(getPolicyApprovalMode(whitelistedOrigin, undefined)).toBe('verify');
    expect(getPolicyApprovalMode(whitelistedOrigin, '')).toBe('verify');
  });

  test('returns verify when neither origin is whitelisted', () => {
    expect(getPolicyApprovalMode(otherOrigin, otherOrigin)).toBe('verify');
  });
});
