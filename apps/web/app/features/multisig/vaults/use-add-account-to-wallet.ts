import { useState } from 'react';

import { useAtom, useAtomValue } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { multisigLeather } from '~/features/multisig/extension/multisig-leather-client';
import { resolveWalletRpcNetwork } from '~/features/multisig/network/resolve-wallet-rpc-network';
import { getMultisigDescriptor } from '~/features/multisig/transactions/btc-multisig-descriptor';
import { getOrderedSigningPubkeys } from '~/features/multisig/transactions/derive-multisig-address';
import { useToast } from '~/features/toasts/use-toast';
import { isLeatherInstalled } from '~/utils/utils';

import type { Vault, VaultAccount, VaultAccountSummary } from '@leather.io/models';

const addedAccountsStorageKey = 'leather:multisig:added-accounts';

type AddedAccountsRecord = Record<string, boolean>;

const addedAccountsAtom = atomWithStorage<AddedAccountsRecord>(
  addedAccountsStorageKey,
  {},
  undefined,
  { getOnInit: true }
);

function addedAccountKey(account: Pick<VaultAccount, 'network' | 'id'>) {
  return `${account.network}:${account.id}`;
}

export function useMissingVaultAccounts(accounts: VaultAccountSummary[] | undefined) {
  const addedAccounts = useAtomValue(addedAccountsAtom);
  return accounts?.filter(account => addedAccounts[addedAccountKey(account)] !== true) ?? [];
}

export function useAddAccountToWallet(vault?: Vault, account?: VaultAccount) {
  const [addedAccounts, setAddedAccounts] = useAtom(addedAccountsAtom);
  const [isAddingToWallet, setIsAddingToWallet] = useState(false);
  const { success, error } = useToast();

  const isAddedToWallet = account ? addedAccounts[addedAccountKey(account)] === true : false;

  async function addAccountToWallet(accountToAdd = account) {
    if (!vault || !accountToAdd) return false;
    if (!isLeatherInstalled()) {
      error('Leather wallet not detected. Install the Leather extension to add this account.');
      return false;
    }

    const network = resolveWalletRpcNetwork(vault.network);

    setIsAddingToWallet(true);
    try {
      if (accountToAdd.network.startsWith('btc')) {
        await multisigLeather.btcAddAccount({
          descriptor: getMultisigDescriptor(accountToAdd),
          name: accountToAdd.name,
          network,
        });
      } else {
        await multisigLeather.stxAddAccount({
          publicKeys: getOrderedSigningPubkeys(accountToAdd),
          threshold: accountToAdd.threshold,
          name: accountToAdd.name,
          network,
        });
      }
      setAddedAccounts(previous => ({ ...previous, [addedAccountKey(accountToAdd)]: true }));
      success(`Added "${accountToAdd.name}" to your wallet`);
      return true;
    } catch (err) {
      error(err instanceof Error ? err.message : 'Failed to add account to wallet');
      return false;
    } finally {
      setIsAddingToWallet(false);
    }
  }

  return { addAccountToWallet, isAddingToWallet, isAddedToWallet };
}
