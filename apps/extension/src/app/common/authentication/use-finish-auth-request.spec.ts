// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';

import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { SoftwareStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.models';

import { useFinishAuthRequest } from './use-finish-auth-request';

Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', true);

const h = vi.hoisted(() => ({
  currentAccount: { fingerprint: 'test-fingerprint', accountIndex: 5 },
  decodedAuthRequest: { public_keys: ['transit-public-key'], scopes: ['store_write'] },
  authRequest: 'auth-request-token',
  version: 7,
  selectStacksAccountById: vi.fn(),
  makeAuthResponse: vi.fn(),
  finalizeAuthResponse: vi.fn(),
  switchAccount: vi.fn(),
  loggerError: vi.fn(),
  getState: vi.fn(() => ({})),
  dispatch: vi.fn(),
  updatePermission: vi.fn((payload: unknown) => ({
    type: 'appPermissions/updatePermission',
    payload,
  })),
}));

vi.mock('@stacks/wallet-sdk', () => ({ makeAuthResponse: h.makeAuthResponse }));

vi.mock('@shared/actions/finalize-auth-response', () => ({
  finalizeAuthResponse: h.finalizeAuthResponse,
}));

vi.mock('@shared/logger', () => ({
  logger: { error: h.loggerError, info: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('@app/store', () => ({ store: { getState: h.getState } }));

vi.mock('@app/store/accounts/blockchain/stacks/stacks-account.selectors', () => ({
  selectStacksAccountById: h.selectStacksAccountById,
}));

vi.mock('@app/common/hooks/auth/use-onboarding-state', () => ({
  useOnboardingState: () => ({
    decodedAuthRequest: h.decodedAuthRequest,
    authRequest: h.authRequest,
  }),
}));

vi.mock('@app/common/hooks/use-key-actions', () => ({
  useKeyActions: () => ({ switchAccount: h.switchAccount }),
}));

vi.mock('@app/common/use-wallet-type', () => ({
  useWalletType: () => ({ walletType: 'software' }),
}));

vi.mock('@app/common/hooks/auth/use-auth-request-params', () => ({
  useAuthRequestParams: () => ({ origin: 'https://app.example.com', tabId: 1 }),
}));

vi.mock('@app/store/in-memory-key/in-memory-key.selectors', () => ({
  useActiveWalletSecretKey: () => 'secret-key',
}));

vi.mock('@app/store/in-memory-key/use-in-memory-keys', () => ({
  useInMemoryKeys: () => ({ version: h.version }),
}));

vi.mock('@app/store/software-keys/software-key.selectors', () => ({
  selectCurrentAccount: vi.fn(),
}));

vi.mock('./use-legacy-auth-bitcoin-addresses', () => ({
  useGetLegacyAuthBitcoinAddresses: () => () => ({}),
}));

vi.mock('@app/store/app-permissions/app-permissions.slice', () => ({
  appPermissionsSlice: { actions: { updatePermission: h.updatePermission } },
}));

vi.mock('@app/store/networks/networks.selectors', () => ({
  useCurrentNetwork: () => ({ chain: { bitcoin: { mode: 'mainnet' } } }),
}));

vi.mock('react-redux', () => ({
  useSelector: () => h.currentAccount,
  useDispatch: () => h.dispatch,
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

function makeSoftwareAccount(accountIndex: number): SoftwareStacksAccount {
  return {
    type: 'software',
    fingerprint: h.currentAccount.fingerprint,
    accountIndex,
    index: accountIndex,
    address: 'SP000000000000000000002Q6VF78',
    stxPublicKey: 'stx-public-key',
    stxPrivateKey: 'stx-private-key',
    dataPublicKey: 'data-public-key',
    dataPrivateKey: 'data-private-key',
    appsKey: 'apps-key',
    salt: 'salt',
  };
}

describe('useFinishAuthRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.getState.mockReturnValue({});
    h.makeAuthResponse.mockResolvedValue('auth-response-token');
  });

  test('approves auth for an account index beyond the enumerated range', async () => {
    // Derived on demand, mirroring a stored permission whose index exceeds
    // the number of accounts created in the UI.
    h.selectStacksAccountById.mockReturnValue(makeSoftwareAccount(5));

    const { getValue } = renderHookValue(() => useFinishAuthRequest());

    await act(async () => {
      await getValue()(5);
    });

    expect(h.selectStacksAccountById).toHaveBeenCalledWith({}, h.version, {
      fingerprint: h.currentAccount.fingerprint,
      accountIndex: 5,
    });
    expect(h.makeAuthResponse).toHaveBeenCalledOnce();
    expect(h.finalizeAuthResponse).toHaveBeenCalledOnce();
  });

  test('persists an app permission for the approved account so signing stays connected', async () => {
    h.selectStacksAccountById.mockReturnValue(makeSoftwareAccount(5));

    const { getValue } = renderHookValue(() => useFinishAuthRequest());

    await act(async () => {
      await getValue()(5);
    });

    expect(h.updatePermission).toHaveBeenCalledWith(
      expect.objectContaining({
        origin: 'app.example.com',
        fingerprint: h.currentAccount.fingerprint,
        accountIndex: 5,
        networkMode: 'mainnet',
        requestedAccounts: expect.any(String),
      })
    );
    expect(h.dispatch).toHaveBeenCalledWith({
      type: 'appPermissions/updatePermission',
      payload: expect.objectContaining({ origin: 'app.example.com', accountIndex: 5 }),
    });
  });

  test('dead-ends without finalizing when the account cannot be resolved', async () => {
    h.selectStacksAccountById.mockReturnValue(undefined);

    const { getValue } = renderHookValue(() => useFinishAuthRequest());

    await act(async () => {
      await getValue()(5);
    });

    expect(h.makeAuthResponse).not.toHaveBeenCalled();
    expect(h.finalizeAuthResponse).not.toHaveBeenCalled();
    expect(h.updatePermission).not.toHaveBeenCalled();
    expect(h.loggerError).toHaveBeenCalledWith('Uh oh! Finished onboarding without auth info.');
  });
});
