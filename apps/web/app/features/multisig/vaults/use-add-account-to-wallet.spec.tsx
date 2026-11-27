import { type ReactNode } from 'react';

import { act, renderHook } from '@testing-library/react';
import { Provider } from 'jotai';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { ToastContext } from '~/features/toasts/use-toast';

import type { AuthNetworkId, Vault, VaultAccount, VaultAccountSummary } from '@leather.io/models';

import { useAddAccountToWallet, useMissingVaultAccounts } from './use-add-account-to-wallet';

const mocks = vi.hoisted(() => ({
  btcAddAccount: vi.fn(),
  stxAddAccount: vi.fn(),
  isLeatherInstalled: vi.fn(),
}));

vi.mock('~/features/multisig/extension/multisig-leather-client', () => ({
  multisigLeather: { btcAddAccount: mocks.btcAddAccount, stxAddAccount: mocks.stxAddAccount },
}));
vi.mock('~/utils/utils', () => ({ isLeatherInstalled: mocks.isLeatherInstalled }));
vi.mock('@leather.io/bitcoin', () => ({}));

const storageKey = 'leather:multisig:added-accounts';
const toast = { success: vi.fn(), error: vi.fn(), info: vi.fn() };

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <Provider>
      <ToastContext.Provider value={toast}>{children}</ToastContext.Provider>
    </Provider>
  );
}

function makeVault(network: AuthNetworkId): Vault {
  return {
    id: 'vault-1',
    name: 'Shared vault',
    theme: null,
    icon: null,
    network,
    status: 'active',
    createdBy: 'creator',
    createdAt: '2026-11-01T00:00:00Z',
    members: [],
  };
}

function makeAccount(network: AuthNetworkId): VaultAccount & VaultAccountSummary {
  return {
    id: 'account-1',
    name: 'Treasury',
    icon: null,
    vaultId: 'vault-1',
    network,
    threshold: 1,
    multisigAddress: 'account-address',
    accountIndex: 0,
    createdAt: '2026-11-01T00:00:00Z',
    signerCount: 1,
    signers: [
      {
        id: 'signer-1',
        userId: 'creator',
        network,
        publicKey: 'public-key',
        address: 'signer-address',
        xpub: 'signer-xpub',
        xpubOriginFingerprint: null,
        xpubOriginPath: null,
        signerIndex: 0,
        signingPubkey: 'signing-key',
      },
    ],
    pendingTransactionCount: 0,
    queuedTransactionCount: 0,
  };
}

describe(useAddAccountToWallet.name, () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
    mocks.isLeatherInstalled.mockReturnValue(true);
  });

  test.each<{ network: AuthNetworkId; rpc: typeof mocks.btcAddAccount; payload: object }>([
    {
      network: 'btc:mainnet',
      rpc: mocks.btcAddAccount,
      payload: { descriptor: 'wsh(sortedmulti(1,signer-xpub/0/0))', network: 'mainnet' },
    },
    {
      network: 'stx:testnet',
      rpc: mocks.stxAddAccount,
      payload: { publicKeys: ['signing-key'], threshold: 1, network: 'testnet' },
    },
  ])(
    'persists a successful add on $network and removes only that row',
    async ({ network, rpc, payload }) => {
      const account = makeAccount(network);
      const sameIdOtherNetwork = makeAccount('stx:mainnet');
      const sameNetworkOtherId = { ...account, id: 'account-2' };
      const accounts = [account, sameIdOtherNetwork, sameNetworkOtherId];
      const { result } = renderHook(
        () => ({
          registration: useAddAccountToWallet(makeVault(network), account),
          missingAccounts: useMissingVaultAccounts(accounts),
        }),
        { wrapper: Wrapper }
      );

      expect(result.current.missingAccounts).toEqual(accounts);
      expect(rpc).not.toHaveBeenCalled();

      await act(() => result.current.registration.addAccountToWallet());

      expect(rpc).toHaveBeenCalledOnce();
      expect(rpc).toHaveBeenCalledWith({ ...payload, name: account.name });
      expect(result.current.registration.isAddedToWallet).toBe(true);
      expect(result.current.missingAccounts).toEqual([sameIdOtherNetwork, sameNetworkOtherId]);
      expect(localStorage.getItem(storageKey)).toBe(
        JSON.stringify({ [`${network}:account-1`]: true })
      );
    }
  );

  test('keeps the selected account retryable after the extension rejects', async () => {
    const account = makeAccount('stx:mainnet');
    mocks.stxAddAccount.mockRejectedValueOnce(new Error('Declined'));
    const { result } = renderHook(
      () => ({
        registration: useAddAccountToWallet(makeVault(account.network)),
        missingAccounts: useMissingVaultAccounts([account]),
      }),
      { wrapper: Wrapper }
    );

    await act(() => result.current.registration.addAccountToWallet(account));

    expect(toast.error).toHaveBeenCalledWith('Declined');
    expect(localStorage.getItem(storageKey)).toBeNull();
    expect(result.current.missingAccounts).toEqual([account]);
    expect(result.current.registration.isAddingToWallet).toBe(false);

    await act(() => result.current.registration.addAccountToWallet(account));

    expect(result.current.missingAccounts).toEqual([]);
  });

  test('keeps the registration available if Leather is missing', async () => {
    mocks.isLeatherInstalled.mockReturnValue(false);
    const account = makeAccount('stx:mainnet');
    const { result } = renderHook(
      () => useAddAccountToWallet(makeVault(account.network), account),
      {
        wrapper: Wrapper,
      }
    );

    await act(() => result.current.addAccountToWallet());

    expect(mocks.stxAddAccount).not.toHaveBeenCalled();
    expect(result.current.isAddedToWallet).toBe(false);
    expect(localStorage.getItem(storageKey)).toBeNull();
    expect(toast.error).toHaveBeenCalledWith(
      'Leather wallet not detected. Install the Leather extension to add this account.'
    );
  });
});
