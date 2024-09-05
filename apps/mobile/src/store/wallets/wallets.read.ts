import { RootState } from '..';
import { Account } from '../accounts/accounts';
import { useAccountsByFingerprint } from '../accounts/accounts.write';
import { AddWalletAction, userAddsWallet, userRemovesWallet } from '../global-action';
import { mnemonicStore } from '../storage-persistors';
import { useAppDispatch, useAppSelector } from '../utils';
import { WalletStore, walletAdapter } from './wallets.write';

const selectors = walletAdapter.getSelectors((state: RootState) => state.wallets);

export function useWalletByFingerprint(fingerprint: string) {
  return useAppSelector(state => selectors.selectById(state, fingerprint));
}

export function useWallets() {
  const dispatch = useAppDispatch();

  return {
    list: useAppSelector(selectors.selectAll),
    add(action: AddWalletAction) {
      return dispatch(userAddsWallet(action));
    },
    remove(fingerprint: string) {
      void mnemonicStore(fingerprint).deleteMnemonic();
      return dispatch(userRemovesWallet({ fingerprint }));
    },
  };
}

interface WalletLoaderProps {
  fingerprint: string;
  fallback?: React.ReactNode;
  children(wallet: WalletStore & { accounts: Account[] }): React.ReactNode;
}
export function WalletLoader({ fingerprint, fallback, children }: WalletLoaderProps) {
  const wallet = useWalletByFingerprint(fingerprint);
  const accounts = useAccountsByFingerprint(fingerprint).list;
  if (!wallet) return fallback ?? null;
  return children({ ...wallet, accounts });
}
