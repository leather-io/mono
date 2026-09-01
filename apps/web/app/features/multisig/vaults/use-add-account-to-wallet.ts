import { useState } from 'react';

import { useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { resolveWalletRpcNetwork } from '~/features/multisig/network/resolve-wallet-rpc-network';
import { getMultisigDescriptor } from '~/features/multisig/transactions/btc-multisig-descriptor';
import { getOrderedSigningPubkeys } from '~/features/multisig/transactions/derive-multisig-address';
import { useToast } from '~/features/toasts/use-toast';
import { leather } from '~/utils/leather-sdk';
import { isLeatherInstalled } from '~/utils/utils';

import type { Vault, VaultAccount } from '@leather.io/models';

const addedAccountsStorageKey = 'leather:multisig:added-accounts';

type AddedAccountsRecord = Record<string, boolean>;

const addedAccountsAtom = atomWithStorage<AddedAccountsRecord>(
  addedAccountsStorageKey,
  {},
  undefined,
  { getOnInit: true }
);

function addedAccountKey(account: VaultAccount) {
  return `${account.network}:${account.id}`;
}

export function useAddAccountToWallet(vault?: Vault, account?: VaultAccount) {
  const [addedAccounts, setAddedAccounts] = useAtom(addedAccountsAtom);
  const [isAddingToWallet, setIsAddingToWallet] = useState(false);
  const { success, error } = useToast();

  const isAddedToWallet = account ? addedAccounts[addedAccountKey(account)] === true : false;

  async function addAccountToWallet() {
    if (!vault || !account) return;
    if (!isLeatherInstalled()) {
      error('Leather wallet not detected. Install the Leather extension to add this account.');
      return;
    }

    const network = resolveWalletRpcNetwork(vault.network);

    setIsAddingToWallet(true);
    try {
      if (account.network.startsWith('btc')) {
        await leather.btcAddAccount({
          descriptor: getMultisigDescriptor(account),
          name: account.name,
          network,
        });
      } else {
        await leather.stxAddAccount({
          publicKeys: getOrderedSigningPubkeys(account),
          threshold: account.threshold,
          name: account.name,
          network,
        });
      }
      setAddedAccounts(previous => ({ ...previous, [addedAccountKey(account)]: true }));
      success(`Added "${account.name}" to your wallet`);
    } catch (err) {
      error(err instanceof Error ? err.message : 'Failed to add account to wallet');
    } finally {
      setIsAddingToWallet(false);
    }
  }

  return { addAccountToWallet, isAddingToWallet, isAddedToWallet };
}
