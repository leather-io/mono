import { useMemo } from 'react';

import { type WalletType, useActiveWalletType } from '@app/store/common/wallet-type.selectors';

function isLedgerWallet(walletType?: WalletType) {
  return walletType === 'ledger';
}

function isSoftwareWallet(walletType?: WalletType) {
  return walletType === 'software';
}

type WalletTypeMap<T> = Record<WalletType, T>;

function whenWallet(walletType?: WalletType) {
  return <T extends WalletTypeMap<unknown>>(walletTypeMap: T) => {
    if (isLedgerWallet(walletType)) return walletTypeMap.ledger as T['ledger'];
    if (isSoftwareWallet(walletType)) return walletTypeMap.software as T['software'];
    throw new Error('Wallet is neither of type `ledger` nor `software`');
  };
}

export function useWalletType() {
  const walletType = useActiveWalletType();

  return useMemo(
    () => ({
      walletType,
      whenWallet: whenWallet(walletType),
    }),
    [walletType]
  );
}
