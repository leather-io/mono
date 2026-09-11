import type { AccountAddresses } from '@leather.io/models';

export interface CopyAddressOption {
  address: string;
  chain: 'bitcoin' | 'stacks';
  format: string;
  id: 'btc-native-segwit' | 'btc-taproot' | 'btc-policy' | 'stx';
  recommended?: boolean;
  title: string;
}

export function createCopyAddressOptions(account: AccountAddresses): CopyAddressOption[] {
  if (account.bitcoin?.type === 'fixedAddress') {
    return [
      {
        address: account.bitcoin.address,
        chain: 'bitcoin',
        format: 'Policy address',
        id: 'btc-policy',
        title: 'Bitcoin',
      },
    ];
  }

  const nativeSegwitAddress = account.bitcoin?.zeroIndexNativeSegwitPayerAddress;
  const taprootAddress = account.bitcoin?.zeroIndexTaprootPayerAddress;
  const stxAddress = account.stacks?.stxAddress;

  const options: (CopyAddressOption | null)[] = [
    nativeSegwitAddress
      ? {
          address: nativeSegwitAddress,
          chain: 'bitcoin',
          format: 'Native SegWit',
          id: 'btc-native-segwit',
          recommended: true,
          title: 'Bitcoin',
        }
      : null,
    taprootAddress
      ? {
          address: taprootAddress,
          chain: 'bitcoin',
          format: 'Taproot',
          id: 'btc-taproot',
          title: 'Bitcoin',
        }
      : null,
    stxAddress
      ? {
          address: stxAddress,
          chain: 'stacks',
          format: 'STX',
          id: 'stx',
          title: 'Stacks',
        }
      : null,
  ];

  return options.filter((option): option is CopyAddressOption => option !== null);
}
