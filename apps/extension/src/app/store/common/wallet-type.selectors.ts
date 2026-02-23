import { useSelector } from 'react-redux';

import { createSelector } from '@reduxjs/toolkit';

import { extractKeyOriginPathFromDescriptor } from '@leather.io/crypto';
import type { AccountId } from '@leather.io/models';
import { createNullArrayOfLength } from '@leather.io/utils';

import { selectStacksChain } from '../chains/stx-chain.selectors';
import { selectBitcoinKeychains, selectStacksKeychains } from '../keychains/keychain.selectors';
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
  [selectWalletEntities, selectStacksChain, selectBitcoinKeychains, selectStacksKeychains],
  (walletEntities, stxChain, bitcoinKeychains, stacksKeychains): WalletAccountRefTree[] => {
    const tree: WalletAccountRefTree[] = [];

    Object.values(walletEntities || {}).forEach(wallet => {
      if (!wallet) return;

      let accountCount = 0;

      // For software wallets, use highestAccountIndex from stxChain
      if (wallet.type === 'software') {
        const stxChainState = stxChain?.[wallet.fingerprint];
        if (stxChainState) {
          accountCount = stxChainState.highestAccountIndex + 1;
        }
      }

      // For Ledger wallets, count the number of keychains
      if (wallet.type === 'ledger') {
        const matchingStacksKeychains = stacksKeychains.filter(keychain => {
          const keyOrigin = extractKeyOriginPathFromDescriptor(keychain.descriptor);
          return keyOrigin?.startsWith(wallet.fingerprint);
        });

        const matchingBitcoinKeychains = bitcoinKeychains.filter(keychain => {
          const keyOrigin = extractKeyOriginPathFromDescriptor(keychain.descriptor);
          return keyOrigin?.startsWith(wallet.fingerprint);
        });

        // Use the maximum count between Stacks and Bitcoin keychains
        accountCount = Math.max(matchingStacksKeychains.length, matchingBitcoinKeychains.length);
      }

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
