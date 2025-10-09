import { t } from '@lingui/core/macro';

import { SwappableFungibleCryptoAsset } from '@leather.io/models';

export function getFungibleAssetDisplayName(asset: SwappableFungibleCryptoAsset) {
  if (asset.symbol === 'STX') return t`Stacks`;
  if (asset.symbol === 'BTC') return t`Bitcoin`;

  return 'name' in asset ? asset.name : asset.symbol;
}

// This exists to allow tracking and replacing decimal-related logic once we
// support locales with other decimal separators.
export const decimalSeparator = '.';
