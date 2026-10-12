import {
  SBTC_ASSET_ID_MAINNET,
  SBTC_ASSET_ID_TESTNET,
  USDCX_ASSET_ID_MAINNET,
  USDCX_ASSET_ID_TESTNET,
} from '@leather.io/constants';
import type { FungibleCryptoAsset } from '@leather.io/models';

const unpinnedAssetPriority = Number.MAX_SAFE_INTEGER;

function toContractId(assetId: string) {
  return assetId.split('::')[0];
}

const sbtcContractIds = [SBTC_ASSET_ID_MAINNET, SBTC_ASSET_ID_TESTNET].map(toContractId);
const usdcxContractIds = [USDCX_ASSET_ID_MAINNET, USDCX_ASSET_ID_TESTNET].map(toContractId);

export function getPinnedAssetPriority(asset: FungibleCryptoAsset) {
  if (asset.protocol === 'nativeBtc') return 0;
  if (asset.protocol === 'nativeStx') return 1;
  if (sbtcContractIds.includes(asset.contractId)) return 2;
  if (usdcxContractIds.includes(asset.contractId)) return 3;
  return unpinnedAssetPriority;
}

export function isPinnedAsset(asset: FungibleCryptoAsset) {
  return getPinnedAssetPriority(asset) !== unpinnedAssetPriority;
}

export function sortByPinnedAssetOrder<T extends { asset: FungibleCryptoAsset }>(
  items: readonly T[]
) {
  return [...items].sort(
    (a, b) => getPinnedAssetPriority(a.asset) - getPinnedAssetPriority(b.asset)
  );
}
