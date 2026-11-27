import {
  type NonFungibleCryptoAsset,
  bnsAssetIdentifiers,
  bnsV1AssetIdentifiers,
} from '@leather.io/models';
import { getStacksContractAssetName } from '@leather.io/stacks';
import { getAssetId, serializeAssetId } from '@leather.io/utils';

export type CollectibleKind = 'nft' | 'bns' | 'legacy-bns';

export interface CollectibleView {
  key: string;
  protocol: NonFungibleCryptoAsset['protocol'];
  kind: CollectibleKind;
  title: string;
  subtitle: string;
  asset: NonFungibleCryptoAsset;
}

function getCollectibleKind(assetId: string): CollectibleKind {
  if (bnsAssetIdentifiers.includes(assetId)) return 'bns';
  if (bnsV1AssetIdentifiers.includes(assetId)) return 'legacy-bns';
  return 'nft';
}

function getSubtitle(kind: CollectibleKind, asset: NonFungibleCryptoAsset) {
  if (kind === 'bns') return 'BNS name';
  if (kind === 'legacy-bns') return 'Legacy BNS';
  return asset.collection?.name ?? 'Stacks collectible';
}

export function createCollectibleView(asset: NonFungibleCryptoAsset): CollectibleView {
  const key = serializeAssetId(getAssetId(asset));
  const assetName = getStacksContractAssetName(asset.assetId);
  const kind = getCollectibleKind(asset.assetId);
  return {
    key,
    protocol: asset.protocol,
    kind,
    title: asset.name || assetName || 'Unknown collectible',
    subtitle: getSubtitle(kind, asset),
    asset,
  };
}

export function createCollectibleViews(assets: NonFungibleCryptoAsset[]) {
  return assets.map(createCollectibleView);
}
