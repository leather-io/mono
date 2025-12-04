import { FadeIn, FadeOut } from 'react-native-reanimated';

import { SearchInput } from '@/components/search-input';
import { AssetSelectorEmptyState } from '@/features/swap/components/asset-selector/asset-selector-empty-state';
import { AssetSelectorItem } from '@/features/swap/components/asset-selector/asset-selector-item';
import { useSwapAssetSearch } from '@/features/swap/components/asset-selector/use-swap-asset-search';
import { getFungibleAssetDisplayName } from '@/features/swap/swap.utils';
import { matchQueryResult } from '@/queries/match-query-result';
import { t } from '@lingui/core/macro';
import { ListRenderItemInfo } from '@shopify/flash-list';
import { UseQueryResult } from '@tanstack/react-query';
import { isDefined } from 'remeda';

import { AccountSwapAsset } from '@leather.io/services';
import { AssetAvatarIcon, BitcoinIcon, Box, Sheet, StacksIcon } from '@leather.io/ui/native';
import { getAssetId, serializeAssetId } from '@leather.io/utils';

import { AssetSelectorError } from './asset-selector-error';
import { AssetSelectorHeader } from './asset-selector-header';
import { AssetSelectorLoadingState } from './asset-selector-loading-state';

interface AssetSelectorProps {
  type: 'base' | 'target';
  selectedBaseAsset: AccountSwapAsset | null;
  selectedTargetAsset: AccountSwapAsset | null;
  query: UseQueryResult<AccountSwapAsset[], Error>;
  onSelectAsset(type: 'base' | 'target', asset: AccountSwapAsset): void;
}

function getAssetIndicator(asset: AccountSwapAsset['asset']) {
  switch (asset.protocol) {
    case 'nativeBtc':
      return <BitcoinIcon variant="small" />;
    case 'nativeStx':
    case 'sip10':
      return <StacksIcon variant="small" />;
    default:
      return undefined;
  }
}

export function AssetSelector({
  type,
  selectedBaseAsset,
  query,
  onSelectAsset,
}: AssetSelectorProps) {
  const { searchTerm, setSearchTerm, searchResults, isPerformingSearch } = useSwapAssetSearch(
    query.data
  );
  const assets = isPerformingSearch ? searchResults : query.data;
  const showSearchHeader =
    query.status === 'pending' || (isDefined(assets) && assets.length > 0) || isPerformingSearch;

  return (
    <Box flex={1}>
      {showSearchHeader && (
        <AssetSelectorHeader>
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder={t`Search for asset`}
            TextInputComponent={Sheet.TextInput}
          />
        </AssetSelectorHeader>
      )}
      {matchQueryResult(query, {
        pending: () => <AssetSelectorLoadingState />,
        error: error => <AssetSelectorError error={error} onRetry={query.refetch} />,
        success: () => {
          if (assets?.length === 0) {
            return (
              <AssetSelectorEmptyState
                type={type}
                onClearSearch={() => setSearchTerm('')}
                isPerformingSearch={isPerformingSearch}
                selectedBaseAsset={selectedBaseAsset}
              />
            );
          }

          return (
            <Sheet.FlashList
              entering={FadeIn.duration(100)}
              exiting={FadeOut.duration(100)}
              data={assets}
              maintainVisibleContentPosition={{ disabled: true }}
              keyExtractor={(item: AccountSwapAsset) => serializeAssetId(getAssetId(item.asset))}
              renderItem={({ item }: ListRenderItemInfo<AccountSwapAsset>) => (
                <AssetSelectorItem
                  name={getFungibleAssetDisplayName(item.asset)}
                  symbol={item.asset.symbol}
                  balance={item.balance?.crypto.availableBalance}
                  quoteBalance={item.balance?.quote.availableBalance}
                  icon={
                    <AssetAvatarIcon asset={item.asset} indicator={getAssetIndicator(item.asset)} />
                  }
                  onPress={() => onSelectAsset(type, item)}
                />
              )}
            />
          );
        },
      })}
    </Box>
  );
}
