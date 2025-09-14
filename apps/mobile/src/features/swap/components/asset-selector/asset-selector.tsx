import { useState } from 'react';

import { SearchInput } from '@/components/search-input';
import {
  AssetAvatar,
  AssetSelectorItem,
} from '@/features/swap/components/asset-selector/asset-selector-item';
import { useProcessedSwapAssets } from '@/features/swap/components/asset-selector/use-processed-swap-assets';
import { getFungibleAssetDisplayName } from '@/features/swap/swap.utils';
import { AccountSwapAsset } from '@/features/swap/temp/service';
import { matchQueryResult } from '@/queries/matchQueryResult';
import { t } from '@lingui/core/macro';
import { UseQueryResult } from '@tanstack/react-query';

import { Box, Sheet } from '@leather.io/ui/native';

import { AssetSelectorError } from './asset-selector-error';
import { AssetSelectorHeader } from './asset-selector-header';
import { AssetSelectorLoadingState } from './asset-selector-loading-state';

interface AssetSelectorProps {
  type: 'base' | 'target';
  query: UseQueryResult<AccountSwapAsset[], Error>;
  onSelectAsset(type: 'base' | 'target', asset: AccountSwapAsset): void;
}

export function AssetSelector({ type, query, onSelectAsset }: AssetSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const processedSwapAssets = useProcessedSwapAssets(query.data, type, searchTerm);

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
        error: error => <AssetSelectorError error={error} />,
        success: () => (
          <Sheet.FlashList
            data={processedSwapAssets}
            renderItem={({ item }) => (
              <AssetSelectorItem
                name={getFungibleAssetDisplayName(item.asset)}
                symbol={item.asset.symbol}
                balance={item.balance?.crypto.availableBalance}
                quoteBalance={item.balance?.quote.availableBalance}
                icon={<AssetAvatar asset={item.asset} />}
                onPress={() => onSelectAsset(type, item)}
              />
            )}
          />
        ),
      })}
    </Box>
  );
}
