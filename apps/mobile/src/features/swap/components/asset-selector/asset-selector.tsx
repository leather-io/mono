import { SearchInput } from '@/components/search-input';
import { AssetAvatar } from '@/features/swap/components/asset-avatar';
import { AssetSelectorEmptyState } from '@/features/swap/components/asset-selector/asset-selector-empty-state';
import { AssetSelectorItem } from '@/features/swap/components/asset-selector/asset-selector-item';
import { useSwapAssetSearch } from '@/features/swap/components/asset-selector/use-swap-asset-search';
import { getFungibleAssetDisplayName } from '@/features/swap/swap.utils';
import { matchQueryResult } from '@/queries/match-query-result';
import { t } from '@lingui/core/macro';
import { UseQueryResult } from '@tanstack/react-query';

import { AccountSwapAsset } from '@leather.io/services';
import { Box, Sheet } from '@leather.io/ui/native';
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

  return (
    <Box flex={1}>
      <AssetSelectorHeader>
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder={t`Search for asset`}
          TextInputComponent={Sheet.TextInput}
        />
      </AssetSelectorHeader>
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
              data={assets}
              maintainVisibleContentPosition={{ disabled: true }}
              keyExtractor={item => serializeAssetId(getAssetId(item.asset))}
              renderItem={({ item }) => (
                <AssetSelectorItem
                  name={getFungibleAssetDisplayName(item.asset)}
                  symbol={item.asset.symbol}
                  balance={item.balance?.crypto.availableBalance}
                  quoteBalance={item.balance?.quote.availableBalance}
                  icon={<AssetAvatar asset={item.asset} indicator />}
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
