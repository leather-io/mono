import { type NonFungibleCryptoAsset } from '@leather.io/models';
import { getStacksContractAssetName } from '@leather.io/stacks';
import { getAssetId, serializeAssetId } from '@leather.io/utils';

export interface CollectibleView {
  key: string;
  protocol: NonFungibleCryptoAsset['protocol'];
  title: string;
  subtitle: string;
  asset: NonFungibleCryptoAsset;
  isBns?: boolean;
}

export function createCollectibleView(asset: NonFungibleCryptoAsset): CollectibleView {
  const key = serializeAssetId(getAssetId(asset));

  switch (asset.protocol) {
    case 'inscription':
      return {
        key,
        protocol: asset.protocol,
        title: `# ${asset.number}`,
        subtitle: 'Ordinal inscription',
        asset,
      };
    case 'stamp':
      return {
        key,
        protocol: asset.protocol,
        title: `# ${asset.stamp}`,
        subtitle: 'Bitcoin Stamp',
        asset,
      };
    case 'sip9': {
      const assetName = getStacksContractAssetName(asset.assetId);
      return {
        key,
        protocol: asset.protocol,
        title: asset.name || assetName || 'Unknown collectible',
        subtitle: asset.collection?.name ?? 'Stacks collectible',
        asset,
        isBns: assetName?.toUpperCase() === 'BNS-V2',
      };
    }
    default:
      return {
        key,
        protocol: asset.protocol,
        title: 'Unknown collectible',
        subtitle: 'Unsupported collectible',
        asset,
      };
  }
}

export function createCollectibleViews(assets: NonFungibleCryptoAsset[]) {
  return assets.map(createCollectibleView);
}
