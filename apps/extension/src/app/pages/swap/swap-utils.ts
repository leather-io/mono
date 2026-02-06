import { SwappableFungibleCryptoAsset } from '@leather.io/models';

export function getFungibleAssetDisplayName(asset: SwappableFungibleCryptoAsset): string {
  if (asset.symbol === 'STX') return 'Stacks';
  if (asset.symbol === 'BTC') return 'Bitcoin';
  return asset.name;
}
