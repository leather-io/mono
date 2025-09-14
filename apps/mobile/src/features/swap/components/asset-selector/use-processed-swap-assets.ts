import { getFungibleAssetDisplayName } from '@/features/swap/swap.utils';
import { AccountSwapAsset } from '@/features/swap/temp/service';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useSettings } from '@/store/settings/settings';
import { AssetVisibility } from '@/store/settings/utils';
import { filter, pipe, sortBy } from 'remeda';

import { isBtcAsset, isSip10Asset, isStxAsset } from '@leather.io/models';
import { getAssetId, serializeAssetId } from '@leather.io/utils';

export function useProcessedSwapAssets(
  data: AccountSwapAsset[] | undefined,
  assetSelectionType: 'base' | 'target',
  searchTerm: string
) {
  const { assetVisibility } = useSettings();
  const debounceDelay = searchTerm.length === 0 ? 0 : 200;
  const debouncedSearchTerm = useDebouncedValue(searchTerm, debounceDelay);

  if (!data) return [];

  return pipe(
    data,
    filter(swapAsset => isRelevantSwapAsset(swapAsset, assetSelectionType, assetVisibility)),
    swapAsset => performAssetSearch(swapAsset, debouncedSearchTerm),
    sortBy(
      getCurrencyPriority,
      swapAsset => -getAvailableQuoteBalance(swapAsset),
      swapAsset => swapAsset.asset.symbol
    )
  );
}

function getCurrencyPriority(swapAsset: AccountSwapAsset): number {
  if (isBtcAsset(swapAsset.asset)) return 0;
  if (isStxAsset(swapAsset.asset)) return 1;
  if (isSip10Asset(swapAsset.asset) && swapAsset.asset.symbol === 'sBTC') return 2;
  return 3;
}

function getAvailableQuoteBalance(swapAsset: AccountSwapAsset): number {
  return swapAsset.balance?.quote.availableBalance.amount.toNumber() ?? 0;
}

function hasPositiveCryptoBalance(swapAsset: AccountSwapAsset): boolean {
  const cryptoBalance = swapAsset.balance?.crypto.availableBalance.amount.toNumber() ?? 0;
  return cryptoBalance > 0;
}

function isRelevantSwapAsset(
  swapAsset: AccountSwapAsset,
  type: 'base' | 'target',
  assetVisibility: AssetVisibility
) {
  const isAssetExplicitlyHidden =
    assetVisibility[serializeAssetId(getAssetId(swapAsset.asset))] === false;

  if (isAssetExplicitlyHidden) {
    return false;
  }

  if (type === 'base') {
    return hasPositiveCryptoBalance(swapAsset);
  }

  return true;
}

function performAssetSearch(items: AccountSwapAsset[], searchTerm: string): AccountSwapAsset[] {
  const normalizedTerm = searchTerm.toLowerCase();
  if (normalizedTerm.length === 0) return items;

  return items.filter(
    item =>
      getFungibleAssetDisplayName(item.asset).toLowerCase().includes(normalizedTerm) ||
      item.asset.symbol.toLowerCase().includes(normalizedTerm)
  );
}
