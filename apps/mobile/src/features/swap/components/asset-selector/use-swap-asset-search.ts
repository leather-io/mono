import { useState } from 'react';

import { getFungibleAssetDisplayName } from '@/features/swap/swap.utils';
import { useDebouncedValue } from '@/hooks/use-debounced-value';

import { AccountSwapAsset } from '@leather.io/services';

export function useSwapAssetSearch(data: AccountSwapAsset[] | undefined) {
  const [searchTerm, setSearchTerm] = useState('');
  const debounceDelay = searchTerm.length === 0 ? 0 : 200;
  const debouncedSearchTerm = useDebouncedValue(searchTerm, debounceDelay);
  const normalizedSearchTerm = normalizeSearchTerm(debouncedSearchTerm);

  if (!data)
    return {
      searchTerm,
      setSearchTerm,
      isPerformingSearch: false,
      searchResults: [],
    };

  return {
    searchTerm,
    setSearchTerm,
    isPerformingSearch: normalizedSearchTerm.length > 0,
    searchResults: performAssetSearch(data, normalizedSearchTerm),
  };
}

function performAssetSearch(
  items: AccountSwapAsset[],
  normalizedSearchTerm: string
): AccountSwapAsset[] {
  if (normalizedSearchTerm.length === 0) return items;

  return items.filter(
    item =>
      getFungibleAssetDisplayName(item.asset).toLowerCase().includes(normalizedSearchTerm) ||
      item.asset.symbol.toLowerCase().includes(normalizedSearchTerm)
  );
}

function normalizeSearchTerm(input: string) {
  return input.trim();
}
