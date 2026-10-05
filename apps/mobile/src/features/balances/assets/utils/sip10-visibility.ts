import { defaultVisibleSip10AssetIds } from '@/shared/default-visible-sip10-assets';

import { serializeAssetId } from '@leather.io/utils';

export function resolveSip10Visibility(assetVisibility: Record<string, boolean>, assetId: string) {
  const userSetting = assetVisibility[serializeAssetId({ protocol: 'sip10', id: assetId })];
  return userSetting ?? defaultVisibleSip10AssetIds.includes(assetId);
}
