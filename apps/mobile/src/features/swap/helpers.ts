import { FungibleCryptoAsset } from '@leather.io/models';
import { getAssetId } from '@leather.io/utils';

export function areSameAssets(first: FungibleCryptoAsset, second: FungibleCryptoAsset) {
  const firstAssetId = getAssetId(first);
  const secondAssetId = getAssetId(second);
  return firstAssetId.protocol === secondAssetId.protocol && firstAssetId.id === secondAssetId.id;
}
