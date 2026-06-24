// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';

import { beforeEach, describe, expect, test, vi } from 'vitest';

import { useCurrentAccountDisplayName } from './use-account-names';

Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', true);

const h = vi.hoisted(() => ({
  effectiveAccount: undefined as
    | { address: string; accountIndex: number; fingerprint: string; index: number; type: string }
    | undefined,
  activeAccountId: { accountIndex: 0, fingerprint: 'fp-active' },
  useAccountNameOverride: vi.fn<(args: unknown) => unknown>(() => undefined),
  createAccountAddresses: vi.fn<
    (id: unknown, descriptors: unknown, stxAddress?: string) => unknown
  >((id, _descriptors, stxAddress) => ({ id, stacks: stxAddress ? { stxAddress } : undefined })),
  bnsQueryConfig: vi.fn<(request: unknown, settings: unknown) => unknown>(() => ({})),
}));

vi.mock('@app/store/accounts/blockchain/stacks/stacks-account.hooks', () => ({
  useCurrentStacksAccount: () => h.effectiveAccount,
}));

vi.mock('@app/store/accounts/account', () => ({
  useCurrentAccountId: () => h.activeAccountId,
}));

vi.mock('@app/store/accounts/accounts.selectors', () => ({
  useAccountNameOverride: (args: unknown) => h.useAccountNameOverride(args),
}));

vi.mock('@leather.io/queries', () => ({
  createAccountBnsNamesQueryConfig: (request: unknown, settings: unknown) =>
    h.bnsQueryConfig(request, settings),
}));

vi.mock('@leather.io/utils', () => ({
  createAccountAddresses: (id: unknown, descriptors: unknown, stxAddress?: string) =>
    h.createAccountAddresses(id, descriptors, stxAddress),
}));

vi.mock('@app/hooks/use-user-settings', () => ({
  useUserSettings: () => ({
    network: { id: 'mainnet' },
    quoteCurrency: 'USD',
    assetVisibility: {},
  }),
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({ data: undefined }),
}));

function renderHookValue<T>(useHook: () => T) {
  let value: T | undefined;
  function TestComponent() {
    value = useHook();
    return null;
  }
  const root = createRoot(document.createElement('div'));
  act(() => {
    root.render(createElement(TestComponent));
  });
  return {
    getValue(): T {
      if (value === undefined) throw new Error('Hook did not render a value');
      return value;
    },
  };
}

describe('useCurrentAccountDisplayName', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.effectiveAccount = undefined;
    h.activeAccountId = { accountIndex: 0, fingerprint: 'fp-active' };
  });

  test('sources address, index and fingerprint from the effective account during a dapp-request override', () => {
    h.effectiveAccount = {
      address: 'SP_EFFECTIVE',
      accountIndex: 5,
      fingerprint: 'fp-effective',
      index: 5,
      type: 'software',
    };
    h.activeAccountId = { accountIndex: 0, fingerprint: 'fp-active' };

    renderHookValue(() => useCurrentAccountDisplayName());

    expect(h.useAccountNameOverride).toHaveBeenCalledWith({
      fingerprint: 'fp-effective',
      accountIndex: 5,
    });
    expect(h.createAccountAddresses).toHaveBeenCalledWith(
      { fingerprint: 'fp-effective', accountIndex: 5 },
      [],
      'SP_EFFECTIVE'
    );
    expect(h.bnsQueryConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        account: expect.objectContaining({ stacks: { stxAddress: 'SP_EFFECTIVE' } }),
      }),
      expect.anything()
    );
  });

  test('uses the resolved account id when the effective account matches the active account', () => {
    h.effectiveAccount = {
      address: 'SP_ACTIVE',
      accountIndex: 0,
      fingerprint: 'fp-active',
      index: 0,
      type: 'software',
    };
    h.activeAccountId = { accountIndex: 0, fingerprint: 'fp-active' };

    renderHookValue(() => useCurrentAccountDisplayName());

    expect(h.useAccountNameOverride).toHaveBeenCalledWith({
      fingerprint: 'fp-active',
      accountIndex: 0,
    });
    expect(h.createAccountAddresses).toHaveBeenCalledWith(
      { fingerprint: 'fp-active', accountIndex: 0 },
      [],
      'SP_ACTIVE'
    );
    expect(h.bnsQueryConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        account: expect.objectContaining({ stacks: { stxAddress: 'SP_ACTIVE' } }),
      }),
      expect.anything()
    );
  });

  test('falls back to the active account id and an empty address when no effective account resolves', () => {
    h.effectiveAccount = undefined;
    h.activeAccountId = { accountIndex: 3, fingerprint: 'fp-active' };

    renderHookValue(() => useCurrentAccountDisplayName());

    expect(h.useAccountNameOverride).toHaveBeenCalledWith({
      fingerprint: 'fp-active',
      accountIndex: 3,
    });
    expect(h.createAccountAddresses).toHaveBeenCalledWith(
      { fingerprint: 'fp-active', accountIndex: 3 },
      [],
      ''
    );
  });
});
