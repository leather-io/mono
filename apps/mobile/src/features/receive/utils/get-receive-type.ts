import { FungibleCryptoAsset } from '@leather.io/models';
import { match } from '@leather.io/utils';

import { ReceiveType } from '../receive-flow-provider';

const protocolMatch = match<FungibleCryptoAsset['protocol']>();

export function getReceiveType(asset: FungibleCryptoAsset) {
  return protocolMatch<ReceiveType>(asset?.protocol, {
    sip10: 'stacks',
    rune: 'taproot',
    brc20: 'taproot',
    src20: 'taproot',
    nativeBtc: 'bitcoin',
    stx20: 'stacks',
    nativeStx: 'stacks',
  });
}
