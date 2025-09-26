import { t } from '@lingui/core/macro';

import { FungibleCryptoAsset } from '@leather.io/models';

export function getFungibleAssetDisplayName(asset: FungibleCryptoAsset) {
  if (asset.symbol === 'STX') return t`Stacks`;
  if (asset.symbol === 'BTC') return t`Bitcoin`;

  return 'name' in asset ? asset.name : asset.symbol;
}
