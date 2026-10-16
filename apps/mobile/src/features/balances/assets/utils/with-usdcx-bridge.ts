import { type Sip10Balance } from '@leather.io/services';
import { isPinnedAsset } from '@leather.io/utils';

interface UsdcxBridgeItem {
  kind: 'usdcxBridge';
  assetId: string;
}

export type AssetsListItem = (Sip10Balance & { kind?: undefined }) | UsdcxBridgeItem;

export function isUsdcxBridgeItem(item: AssetsListItem) {
  return item.kind === 'usdcxBridge';
}

interface ShouldShowUsdcxBridgeArgs {
  usdcxBalance: Sip10Balance | undefined;
  isMainnet: boolean;
  isVisible: boolean;
}
export function shouldShowUsdcxBridge({
  usdcxBalance,
  isMainnet,
  isVisible,
}: ShouldShowUsdcxBridgeArgs) {
  if (!isMainnet || !isVisible || !usdcxBalance) return false;
  return usdcxBalance.crypto.totalBalance.amount.isZero();
}

export function withUsdcxBridge(
  sortedSip10s: Sip10Balance[],
  usdcxAssetId: string,
  showBridge: boolean
): AssetsListItem[] {
  const holdsUsdcx = sortedSip10s.some(sip10 => sip10.asset.assetId === usdcxAssetId);
  if (holdsUsdcx || !showBridge) return sortedSip10s;
  const pinnedCount = sortedSip10s.filter(sip10 => isPinnedAsset(sip10.asset)).length;
  return [
    ...sortedSip10s.slice(0, pinnedCount),
    { kind: 'usdcxBridge', assetId: usdcxAssetId },
    ...sortedSip10s.slice(pinnedCount),
  ];
}
