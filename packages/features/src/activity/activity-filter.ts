import type { CryptoAsset } from '@leather.io/models';
import { type SerializedCryptoAssetId, getAssetId, serializeAssetId } from '@leather.io/utils';

import type { ActivityView } from './types';

function getActivityViewAssetIds(view: ActivityView): SerializedCryptoAssetId[] {
  const assets = [view.asset, view.fromAsset, view.toAsset].filter(
    (value): value is CryptoAsset => !!value
  );
  return assets.map(asset => serializeAssetId(getAssetId(asset)));
}

export function filterActivityBySerializedAssetId(
  activity: ActivityView[],
  serializedAssetId: SerializedCryptoAssetId
) {
  return activity.filter(view => getActivityViewAssetIds(view).includes(serializedAssetId));
}

export function filterActivityByAsset(activity: ActivityView[], asset: CryptoAsset) {
  const serializedAssetId = serializeAssetId(getAssetId(asset));
  return filterActivityBySerializedAssetId(activity, serializedAssetId);
}
