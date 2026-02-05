import { useSelector } from 'react-redux';

import { createSelector } from '@reduxjs/toolkit';

import { extractAccountIndexFromPath } from '@leather.io/crypto';
import type { AccountId } from '@leather.io/models';
import { createNullArrayOfLength } from '@leather.io/utils';

import { selectStacksChain } from '../chains/stx-chain.selectors';
import { selectBitcoinKeychainEntities } from '../ledger/bitcoin/bitcoin-key.slice';
import { selectWalletStacksKeys } from '../ledger/stacks/stacks-key.slice';
import { selectCurrentAccount } from '../software-keys/software-key.selectors';
import { selectWalletEntities } from '../wallets/wallet.selectors';

export type WalletType = 'ledger' | 'software';

export const selectActiveWalletType = createSelector(
  selectCurrentAccount,
  selectWalletEntities,
  (currentAccount, walletEntities) => {
    if (!currentAccount) return undefined;
    const wallet = walletEntities[currentAccount.fingerprint];
    if (!wallet) return undefined;
    return wallet.type;
  }
);

export function useActiveWalletType() {
  return useSelector(selectActiveWalletType);
}

interface WalletAccountRefTree {
  fingerprint: string;
  name: string;
  type: WalletType;
  accounts: AccountId[];
  createdOn: string | null;
}

// This renders a tree of wallets and their child accounts as an array. This
// should be used to render virtualised lists, where list item components take
// care of account look up themselves, as a way to lazily derive account details
// when needed.
const selectWalletAccountRefTree = createSelector(
  [selectWalletEntities, selectStacksChain, selectBitcoinKeychainEntities, selectWalletStacksKeys],
  (walletEntities, stxChain, bitcoinKeychainEntities, ledgerStacksKeys): WalletAccountRefTree[] => {
    const tree: WalletAccountRefTree[] = [];

    Object.values(walletEntities || {}).forEach(wallet => {
      if (!wallet) return;

      const allAccountIndices: number[] = [];

      // Collect account indices from software Stacks accounts
      const stxChainState = stxChain?.[wallet.fingerprint];
      if (stxChainState) {
        for (let i = 0; i <= stxChainState.highestAccountIndex; i++) {
          allAccountIndices.push(i);
        }
      }

      // Collect account indices from Ledger Stacks keys
      ledgerStacksKeys
        .filter(key => key.fingerprint === wallet.fingerprint)
        .forEach((_, index) => allAccountIndices.push(index));

      // Collect account indices from Bitcoin keys
      Object.values(bitcoinKeychainEntities || {})
        .filter(key => key?.fingerprint === wallet.fingerprint)
        .forEach(key => {
          const accountIndex = extractAccountIndexFromPath(key.path);
          if (accountIndex !== null) allAccountIndices.push(accountIndex);
        });

      if (allAccountIndices.length === 0) return;

      const highestAccountIndex = Math.max(...allAccountIndices);
      const accountCount = highestAccountIndex + 1;

      const accounts = createNullArrayOfLength(accountCount).map((_, i) => ({
        fingerprint: wallet.fingerprint,
        accountIndex: i,
      })) satisfies AccountId[];

      tree.push({
        fingerprint: wallet.fingerprint,
        name: wallet.name ?? wallet.fingerprint,
        type: wallet.type as WalletType,
        accounts,
        createdOn: wallet.createdOn,
      });
    });

    return tree.sort((a, b) => {
      if (a.createdOn === null && b.createdOn === null) return 0;
      if (a.createdOn === null) return -1;
      if (b.createdOn === null) return 1;
      return new Date(a.createdOn).getTime() - new Date(b.createdOn).getTime();
    });
  }
);

export function useWalletAccountRefTree() {
  return useSelector(selectWalletAccountRefTree);
}
