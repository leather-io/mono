import { createAction } from '@reduxjs/toolkit';

import { BitcoinKeychainStore } from './keychains/bitcoin/bitcoin-keychains.slice';
import { StacksKeychainStore } from './keychains/stacks/stacks-keychains.slice';
import { PartialWalletStore } from './wallets/wallets.slice';

export const resetWallet = createAction('global/resetWallet');

// Helper function to be called within a slice's `extraReducers.addCase` method
export function handleAppResetWithState<T>(state: T) {
  return [resetWallet, () => state] as const;
}

export interface AddWalletAction {
  wallet: PartialWalletStore;
  withKeychains: {
    bitcoin: BitcoinKeychainStore[];
    stacks: StacksKeychainStore[];
  };
}
export const userAddsWallet = createAction<AddWalletAction>('global/userAddsWallet');

export interface RemoveWalletAction {
  fingerprint: string;
}
export const userRemovesWallet = createAction<RemoveWalletAction>('global/userRemovesWallet');
