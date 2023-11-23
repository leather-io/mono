enum WalletType {
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

function whenWallet(walletType: WalletType) {
  return <T extends WalletTypeMap<unknown>>(walletTypeMap: T) => {
    if (isLedgerWallet(walletType)) return walletTypeMap.ledger as T[WalletType.Ledger];
    if (isSoftwareWallet(walletType)) return walletTypeMap.software as T[WalletType.Software];
    throw new Error('Wallet is neither of type `ledger` nor `software`');
  };
}

export interface KeyConfig {
  type: 'software';
  id: 'default';
  encryptedSecretKey: string;
  salt: string;
}

export function useWalletType({
  hasLedgerKeys,
  wallet,
}: {
  hasLedgerKeys: boolean;
  wallet: KeyConfig | undefined;
}) {
  const isLedger = hasLedgerKeys;

  // Any type here allows use within app without handling undefined
  // case will error when use within onboarding
  let walletType: any;

  if (wallet?.encryptedSecretKey) {
    walletType = WalletType.Software;
  }

  if (isLedger) {
    walletType = WalletType.Ledger;
  }

  return {
    walletType,
    whenWallet: whenWallet(walletType),
  };
}
