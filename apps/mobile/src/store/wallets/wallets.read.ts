import { createSelector } from '@reduxjs/toolkit';

import { WalletId } from '@leather.io/models';

import { RootState } from '..';
import { Account } from '../accounts/accounts';
import { useAccountsByFingerprint } from '../accounts/accounts.read';
import {
  AddReadonlyWalletAction,
  AddWalletAction,
  userAddsReadonlyWallet,
  userAddsWallet,
  userRemovesWallet,
} from '../global-action';
import { mnemonicStore } from '../storage-persistors';
import { useAppDispatch, useAppSelector } from '../utils';
import { WalletStore } from './utils';
import { walletAdapter } from './wallets.write';

export const walletSelectors = walletAdapter.getSelectors((state: RootState) => state.wallets);

export function useWalletByFingerprint(fingerprint: string) {
  return useAppSelector(state => walletSelectors.selectById(state, fingerprint));
}
export const selectReadonlyWallets = createSelector(walletSelectors.selectAll, wallets =>
  wallets.filter(wallet => wallet.isReadonly)
);
export const selectReadWriteWallets = createSelector(walletSelectors.selectAll, wallets =>
  wallets.filter(wallet => !wallet.isReadonly)
);
export const selectReadonlyWalletFingerprints = createSelector(selectReadonlyWallets, wallets =>
  wallets.map(wallet => wallet.fingerprint)
);

export function useReadonlyWalletFingerprints() {
  return useAppSelector(state => selectReadonlyWalletFingerprints(state));
}

export function useReadonlyWallets() {
  return useAppSelector(state => selectReadonlyWallets(state));
}

export function useWallets() {
  const dispatch = useAppDispatch();
  const wallets = useAppSelector(walletSelectors.selectAll);
  const readWriteWallets = useAppSelector(selectReadWriteWallets);
  return {
    list: wallets,
    hasWallets: wallets.length > 0,
    hasReadWriteWallets: readWriteWallets.length > 0,
    add(params: { action: AddWalletAction }) {
      return dispatch(userAddsWallet(params.action));
    },
    addReadonly(params: { action: AddReadonlyWalletAction }) {
      return dispatch(userAddsReadonlyWallet(params.action));
    },
    remove(fingerprint: string) {
      void mnemonicStore(fingerprint).deleteMnemonic();
      return dispatch(userRemovesWallet({ fingerprint }));
    },
  };
}

interface WalletLoaderProps extends WalletId {
  fallback?: React.ReactNode;
  children(wallet: WalletStore & { accounts: Account[] }): React.ReactNode;
}
export function WalletLoader({ fingerprint, fallback, children }: WalletLoaderProps) {
  const wallet = useWalletByFingerprint(fingerprint);
  const accounts = useAccountsByFingerprint(fingerprint).list;
  if (!wallet) return fallback ?? null;
  return children({ ...wallet, accounts });
}
