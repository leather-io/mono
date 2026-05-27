import { FungibleCryptoAsset, FungibleCryptoAssetProtocol } from '@leather.io/models';

export type ReceiveType = 'stacks' | 'bitcoin' | 'native-segwit' | 'taproot' | 'all';

const protocolToReceiveType = {
  sip10: 'stacks',
  nativeBtc: 'bitcoin',
  nativeStx: 'stacks',
} as const satisfies Record<FungibleCryptoAssetProtocol, ReceiveType>;

export function getReceiveType(asset: FungibleCryptoAsset): ReceiveType {
  return protocolToReceiveType[asset?.protocol];
}
