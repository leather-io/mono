export enum WalletType {
  Ledger = 'ledger',
  Software = 'software',
}

function isLedgerWallet(walletType: WalletType) {
  return walletType === 'ledger';
}

function isSoftwareWallet(walletType: WalletType) {
  return walletType === 'software';
}

type WalletTypeMap<T> = Record<WalletType, T>;

export function whenWallet(walletType: WalletType) {
  return <T extends WalletTypeMap<unknown>>(walletTypeMap: T) => {
    if (isLedgerWallet(walletType)) return walletTypeMap.ledger as T[WalletType.Ledger];
    if (isSoftwareWallet(walletType)) return walletTypeMap.software as T[WalletType.Software];
    throw new Error('Wallet is neither of type `ledger` nor `software`');
  };
}
