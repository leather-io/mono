import { useMemo } from 'react';

import { type WalletType, useActiveWalletType } from '@app/store/common/wallet-type.selectors';

function isLedgerWallet(walletType?: WalletType) {
  return walletType === 'ledger';
}

function isSoftwareWallet(walletType?: WalletType) {
  return walletType === 'software';
}

interface WalletTypeMap<TLedger, TSoftware> {
  ledger: TLedger;
  software: TSoftware;
}

function whenWallet(walletType?: WalletType) {
  return <TLedger, TSoftware>(walletTypeMap: WalletTypeMap<TLedger, TSoftware>) => {
    if (isLedgerWallet(walletType)) return walletTypeMap.ledger;
    if (isSoftwareWallet(walletType)) return walletTypeMap.software;
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
