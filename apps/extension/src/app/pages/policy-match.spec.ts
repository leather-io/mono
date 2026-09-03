import { describe, expect, test } from 'vitest';

import { getPolicyApprovalMode, policyCallout } from './policy-match';

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

describe(policyCallout.name, () => {
  const multisigRequirement =
    'You need to use an account that is connected to this multisig account.';

  test('states the multisig account requirement by default', () => {
    expect(policyCallout('match', 'Bitcoin')).toEqual({
      variant: 'info',
      message: multisigRequirement,
    });
    expect(policyCallout('mismatch', 'Bitcoin')).toEqual({
      variant: 'warning',
      message: `Your active Bitcoin account isn't connected to this multisig account. ${multisigRequirement}`,
    });
    expect(policyCallout('no-active-account', 'Stacks')).toEqual({
      variant: 'warning',
      message: `No active Stacks account. ${multisigRequirement}`,
    });
  });

  test('substitutes a custom subject', () => {
    const vaultRequirement = 'You need to use an account that is connected to this vault.';
    expect(policyCallout('match', 'Bitcoin', 'this vault').message).toBe(vaultRequirement);
    expect(policyCallout('mismatch', 'Bitcoin', 'this vault')).toEqual({
      variant: 'warning',
      message: `Your active Bitcoin account isn't connected to this vault. ${vaultRequirement}`,
    });
  });
});
