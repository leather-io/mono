import { WalletId } from '@leather.io/models';

import { RootState } from '..';
import { Account } from '../accounts/accounts';
import { useAccountsByFingerprint } from '../accounts/accounts.read';
import { AddWalletAction, userAddsWallet, userRemovesWallet } from '../global-action';
import { mnemonicStore } from '../storage-persistors';
import { useAppDispatch, useAppSelector } from '../utils';
import { WalletStore } from './utils';
import { walletAdapter } from './wallets.write';

const selectors = walletAdapter.getSelectors((state: RootState) => state.wallets);

export function useWalletByFingerprint(fingerprint: string) {
  return useAppSelector(state => selectors.selectById(state, fingerprint));
}

export function useWallets() {
  const dispatch = useAppDispatch();
  const list = useAppSelector(selectors.selectAll);
  return {
    list,
    hasWallets: list.length > 0,
    add(action: AddWalletAction) {
      return dispatch(userAddsWallet(action));
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

interface WalletFingerprintLoaderProps {
  children(fingerprints: [string, ...string[]]): React.ReactNode;
}
export function WalletFingerprintLoader({ children }: WalletFingerprintLoaderProps) {
  const fingerprints = useWallets().list.map(wallet => wallet.fingerprint);
  if (fingerprints.length === 0) return null;
  return children(fingerprints as [string, ...string[]]);
}
