import { WalletId } from '@leather.io/models';
import {
  AddWalletPayload,
  WalletStore,
  userAddsWallet,
  userRemovesWallet,
  walletAdapter,
} from '@leather.io/state/wallet';

import { RootState } from '..';
import { Account } from '../accounts/accounts';
import { useAccountsByFingerprint } from '../accounts/accounts.read';
import { mnemonicStore } from '../secure-store/mnemonic-store';
import { useAppDispatch, useAppSelector } from '../utils';

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
    add(action: AddWalletPayload) {
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
