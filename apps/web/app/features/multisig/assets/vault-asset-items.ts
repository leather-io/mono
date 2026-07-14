import {
  SBTC_ASSET_ID_MAINNET,
  SBTC_ASSET_ID_TESTNET,
  USDCX_ASSET_ID_MAINNET,
  USDCX_ASSET_ID_TESTNET,
} from '@leather.io/constants';
import type { FungibleCryptoAsset, Money, QuoteCurrency } from '@leather.io/models';
import type { AssetListItem } from '@leather.io/services';
import { type SerializedCryptoAssetId, createMoney } from '@leather.io/utils';

export type VaultNetworkMode = 'mainnet' | 'testnet';

export interface VaultAssetItem {
  id: SerializedCryptoAssetId;
  asset: FungibleCryptoAsset;
  crypto: Money;
  fiat: Money;
}

const usdcxAssetIds: Record<VaultNetworkMode, string> = {
  mainnet: USDCX_ASSET_ID_MAINNET,
  testnet: USDCX_ASSET_ID_TESTNET,
};

const sbtcAssetIds: Record<VaultNetworkMode, string> = {
  mainnet: SBTC_ASSET_ID_MAINNET,
  testnet: SBTC_ASSET_ID_TESTNET,
};

function matchesAssetId(asset: FungibleCryptoAsset, assetId: string) {
  if (asset.protocol !== 'sip10') return false;
  return asset.assetId === assetId || asset.contractId === assetId;
}

function pinPriority(asset: FungibleCryptoAsset, mode: VaultNetworkMode) {
  if (asset.protocol === 'nativeBtc' || asset.protocol === 'nativeStx') return 0;
  if (matchesAssetId(asset, usdcxAssetIds[mode])) return 1;
  if (matchesAssetId(asset, sbtcAssetIds[mode])) return 2;
  return 3;
}

function isPinnedVaultAsset(asset: FungibleCryptoAsset, mode: VaultNetworkMode) {
  return pinPriority(asset, mode) < 3;
}

function hasPositiveBalance(item: AssetListItem) {
  return item.balance !== undefined && Number(item.balance.crypto.totalBalance.amount) > 0;
}

function compareVaultAssetItems(mode: VaultNetworkMode) {
  return (a: VaultAssetItem, b: VaultAssetItem) => {
    const priorityDiff = pinPriority(a.asset, mode) - pinPriority(b.asset, mode);
    if (priorityDiff !== 0) return priorityDiff;

    const fiatDiff = Number(b.fiat.amount) - Number(a.fiat.amount);
    if (fiatDiff !== 0) return fiatDiff;

    return a.asset.symbol.localeCompare(b.asset.symbol);
  };
}

export function buildVaultAssetItems(
  items: AssetListItem[],
  quoteCurrency: QuoteCurrency,
  mode: VaultNetworkMode
): VaultAssetItem[] {
  return items
    .filter(item => hasPositiveBalance(item) || isPinnedVaultAsset(item.asset, mode))
    .map(item => ({
      id: item.id,
      asset: item.asset,
      crypto:
        item.balance?.crypto.totalBalance ?? createMoney(0, item.asset.symbol, item.asset.decimals),
      fiat: item.balance?.quote.totalBalance ?? createMoney(0, quoteCurrency),
    }))
    .sort(compareVaultAssetItems(mode));
}

export function filterSendableVaultAssets(items: VaultAssetItem[]): VaultAssetItem[] {
  return items.filter(
    item => item.asset.protocol === 'nativeStx' || item.crypto.amount.isGreaterThan(0)
  );
}
