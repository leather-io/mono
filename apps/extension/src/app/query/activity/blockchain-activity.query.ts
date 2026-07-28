import { type InfiniteData, useInfiniteQuery, useQuery } from '@tanstack/react-query';

import {
  type BlockchainActivityItem,
  type BlockchainActivityViewDeps,
  createBlockchainActivityItems,
} from '@leather.io/features';
import type { AccountAddresses, BlockchainActivity, CryptoAsset, Money } from '@leather.io/models';
import {
  createBlockchainActivityByAssetIdQueryConfig,
  createBlockchainActivityInfiniteQueryConfig,
} from '@leather.io/queries';
import type { ActivityResponse } from '@leather.io/services';
import { type FormatAmountOptions, getAssetId } from '@leather.io/utils';

import { formatCurrency } from '@app/common/currency-formatter';
import { useUserSettings } from '@app/hooks/use-user-settings';

const feedPageSize = 25;

function formatActivityMoney(money: Money, options?: FormatAmountOptions) {
  return formatCurrency(money, { ...options, showCurrency: false });
}

const activityViewDeps: BlockchainActivityViewDeps = { formatMoney: formatActivityMoney };

function selectBlockchainActivityFeedItems(data: InfiniteData<ActivityResponse>) {
  return createBlockchainActivityItems(
    data.pages.flatMap(page => page.items),
    activityViewDeps
  );
}

function selectBlockchainActivityItems(activities: BlockchainActivity[]) {
  return createBlockchainActivityItems(activities, activityViewDeps);
}

export function useBlockchainActivityByAssetId(account: AccountAddresses, asset: CryptoAsset) {
  const settings = useUserSettings();

  return useQuery({
    ...createBlockchainActivityByAssetIdQueryConfig(account, getAssetId(asset), settings),
    select: selectBlockchainActivityItems,
  });
}

interface BlockchainActivityFeed {
  items: BlockchainActivityItem[];
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage(): void;
  refetch(): void;
}

export function useBlockchainActivityFeed(account: AccountAddresses): BlockchainActivityFeed {
  const settings = useUserSettings();

  const feedQuery = useInfiniteQuery({
    ...createBlockchainActivityInfiniteQueryConfig({ account, limit: feedPageSize }, settings),
    select: selectBlockchainActivityFeedItems,
  });

  return {
    items: feedQuery.data ?? [],
    isLoading: feedQuery.isLoading,
    isError: feedQuery.isError,
    isSuccess: feedQuery.isSuccess,
    hasNextPage: feedQuery.hasNextPage,
    isFetchingNextPage: feedQuery.isFetchingNextPage,
    fetchNextPage: () => void feedQuery.fetchNextPage(),
    refetch: () => void feedQuery.refetch(),
  };
}
