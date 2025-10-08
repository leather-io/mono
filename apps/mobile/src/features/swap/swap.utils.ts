import { t } from '@lingui/core/macro';

import { SupportedAsset } from './swap-state/swap-state.types';

export function getFungibleAssetDisplayName(asset: SupportedAsset) {
  if (asset.symbol === 'STX') return t`Stacks`;
  if (asset.symbol === 'BTC') return t`Bitcoin`;

  return 'name' in asset ? asset.name : asset.symbol;
}
