import { FungibleCryptoAsset, FungibleCryptoAssetProtocol } from '@leather.io/models';

export type ReceiveType = 'stacks' | 'bitcoin' | 'native-segwit' | 'taproot' | 'all';

const protocolToReceiveType = {
  sip10: 'stacks',
  rune: 'taproot',
  brc20: 'taproot',
  src20: 'taproot',
  nativeBtc: 'bitcoin',
  stx20: 'stacks',
  nativeStx: 'stacks',
} as const satisfies Record<FungibleCryptoAssetProtocol, ReceiveType>;

export function getReceiveType(asset: FungibleCryptoAsset): ReceiveType {
  return protocolToReceiveType[asset?.protocol];
}
