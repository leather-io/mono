import { WalletId } from '@/models/domain.model';
import { createAction } from '@reduxjs/toolkit';

import { BitcoinKeychain } from './keychains/bitcoin/utils';
import { StacksKeychain } from './keychains/stacks/utils';
import { PartialWalletStore } from './wallets/utils';

export const resetWallet = createAction('global/resetWallet');

// Helper function to be called within a slice's `extraReducers.addCase` method
export function handleAppResetWithState<T>(state: T) {
  return [resetWallet, () => state] as const;
}

export interface AddWalletAction {
  wallet: PartialWalletStore;
  withKeychains: {
    bitcoin: BitcoinKeychain[];
    stacks: StacksKeychain[];
  };
}
export const userAddsWallet = createAction<AddWalletAction>('global/userAddsWallet');

export type RemoveWalletAction = WalletId;
export const userRemovesWallet = createAction<RemoveWalletAction>('global/userRemovesWallet');
