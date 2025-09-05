import { FungibleCryptoAsset } from '@leather.io/models';
import { getAssetId, isDefined, serializeAssetId } from '@leather.io/utils';

import { AccountRequestFilteringOptions } from '../types';

export function filterUsingAssetVisibility(
  ft: FungibleCryptoAsset,
  assetVisibility: AccountRequestFilteringOptions['assetVisibility']
) {
  const assetVisibilityValue = assetVisibility?.[serializeAssetId(getAssetId(ft))];
  if (isDefined(assetVisibilityValue)) {
    return assetVisibilityValue;
  }
  return true;
}
