export const CryptoAssetSelectors = {
  CryptoAssetList: 'crypto-asset-list',
  CryptoAssetListItem: 'crypto-asset-list-item-{symbol}',
} as const;
export type CryptoAssetSelectors = (typeof CryptoAssetSelectors)[keyof typeof CryptoAssetSelectors];
