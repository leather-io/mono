import { UseQueryResult } from '@tanstack/react-query';
import { Box, Flex } from 'leather-styles/jsx';

import { AccountSwapAsset } from '@leather.io/services';

import { SearchInput } from '@app/components/search-input';
import { matchQueryResult } from '@app/query/match-query-result';

import { AssetSelectorEmptyState } from './asset-selector-empty-state';
import { AssetSelectorError } from './asset-selector-error';
import { AssetSelectorList } from './asset-selector-list';
import { AssetSelectorLoadingState } from './asset-selector-loading-state';
import { useSwapAssetSearch } from './use-swap-asset-search';

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
  const hasAssets = !!assets?.length;
  const showSearchHeader = query.status === 'pending' || hasAssets || isPerformingSearch;

  return (
    <Flex direction="column" height="100%" overflow="hidden">
      {showSearchHeader && (
        <Box px="space.05" pb="space.04" bg="ink.background-primary">
          <SearchInput
            autoFocus
            placeholder="Search for asset"
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </Box>
      )}
      {matchQueryResult(query, {
        pending: () => <AssetSelectorLoadingState />,
        error: error => <AssetSelectorError error={error} onRetry={() => void query.refetch()} />,
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

          return <AssetSelectorList assets={assets} type={type} onSelectAsset={onSelectAsset} />;
        },
      })}
    </Flex>
  );
}
