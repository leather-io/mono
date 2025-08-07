import { capitalize } from 'remeda';

import { FungibleCryptoAsset } from '@leather.io/models';

//  need to make this bulletproof
export function getTokenName(asset: FungibleCryptoAsset, showTicker = false) {
  if (asset?.protocol === 'sip10') {
    return asset.name;
  }

  return `${capitalize(asset?.chain)} ${showTicker ? `(${asset.symbol})` : ''}`;
}
