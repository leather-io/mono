import { type NonFungibleCryptoAsset } from '@leather.io/models';
import { getStacksContractAssetName } from '@leather.io/stacks';
import { assertUnreachable, getAssetId, serializeAssetId } from '@leather.io/utils';

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
    case 'sip9': {
      const assetName = getStacksContractAssetName(asset.assetId);
      const isBns =
        asset.assetId.toLowerCase().endsWith('.bns::names') ||
        assetName?.toUpperCase() === 'BNS-V2';
      return {
        key,
        protocol: asset.protocol,
        title: asset.name || assetName || 'Unknown collectible',
        subtitle: asset.collection?.name ?? 'Stacks collectible',
        asset,
        isBns,
      };
    }
    default:
      return assertUnreachable(asset);
  }
}

export function createCollectibleViews(assets: NonFungibleCryptoAsset[]) {
  return assets.map(createCollectibleView);
}
