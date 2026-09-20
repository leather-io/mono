import { type InfiniteData, useInfiniteQuery, useQuery } from '@tanstack/react-query';

import {
  type BlockchainActivityItem,
  type BlockchainActivityViewDeps,
  createBlockchainActivityItem,
  createBlockchainActivityItems,
} from '@leather.io/features';
import type {
  AccountAddresses,
  BlockchainActivity,
  CryptoAsset,
  CryptoAssetChain,
  Money,
} from '@leather.io/models';
import {
  createBlockchainActivityByAssetIdQueryConfig,
  createBlockchainActivityByTxIdQueryConfig,
  createBlockchainActivityInfiniteQueryConfig,
  createBlockchainActivityInfiniteQueryKey,
} from '@leather.io/queries';
import { type ActivityResponse, getHttpCacheService } from '@leather.io/services';
import { type FormatAmountOptions, getAssetId } from '@leather.io/utils';

import { formatCurrency } from '@app/common/currency-formatter';
import { queryClient } from '@app/common/persistence';
import { useUserSettings } from '@app/hooks/use-user-settings';

const feedPageSize = 25;
const feedRefetchInterval = 15_000;
const feedRefetchMaxPages = 2;
const unresolvedTxRefetchLimit = 4;

const activityQueryPrefixes = [
  'blockchain-activity-service--get-activity',
  'blockchain-activity-service--get-activity-infinite',
  'blockchain-activity-service--get-activity-by-asset-id',
  'blockchain-activity-service--get-activity-by-tx-id',
];

export async function invalidateActivityQueries() {
  await Promise.all([
    getHttpCacheService().clear('leather-api-bitcoin-descriptor-transactions'),
    getHttpCacheService().clear('leather-api-bitcoin-address-transactions'),
  ]);
  await Promise.all(
    activityQueryPrefixes.map(prefix => queryClient.invalidateQueries({ queryKey: [prefix] }))
  );
}

function formatActivityMoney(money: Money, options?: FormatAmountOptions) {
  return formatCurrency(money, { ...options, showCurrency: false });
}

export const activityViewDeps: BlockchainActivityViewDeps = { formatMoney: formatActivityMoney };

function selectBlockchainActivityFeedItems(data: InfiniteData<ActivityResponse>) {
  return createBlockchainActivityItems(
    data.pages.flatMap(page => page.items),
    activityViewDeps
  );
}

function selectBlockchainActivityItems(activities: BlockchainActivity[]) {
  return createBlockchainActivityItems(activities, activityViewDeps);
}

function selectBlockchainActivityItem(activity: BlockchainActivity | null) {
  return activity ? createBlockchainActivityItem(activity, activityViewDeps) : null;
}

function findCachedFeedActivity(feedQueryKey: readonly unknown[], txid: string) {
  return queryClient
    .getQueryData<InfiniteData<ActivityResponse>>(feedQueryKey)
    ?.pages.flatMap(page => page.items)
    .find(activity => activity.txid === txid);
}

export function useBlockchainActivityByTxId(
  account: AccountAddresses,
  chain: CryptoAssetChain,
  txid: string
) {
  const settings = useUserSettings();
  const feedQueryKey = createBlockchainActivityInfiniteQueryKey(
    { account, limit: feedPageSize },
    settings
  );

  return useQuery({
    ...createBlockchainActivityByTxIdQueryConfig(account, chain, txid, settings),
    select: selectBlockchainActivityItem,
    initialData: () => findCachedFeedActivity(feedQueryKey, txid),
    initialDataUpdatedAt: () => queryClient.getQueryState(feedQueryKey)?.dataUpdatedAt,
    refetchInterval(query) {
      const activity = query.state.data;
      if (activity) return activity.status === 'pending' ? feedRefetchInterval : false;
      return query.state.dataUpdateCount < unresolvedTxRefetchLimit ? feedRefetchInterval : false;
    },
  });
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
  isRefetchError: boolean;
  isFetchNextPageError: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage(): void;
  refetch(): void;
}

interface BlockchainActivityFeedOptions {
  poll?: boolean;
}

export function useBlockchainActivityFeed(
  account: AccountAddresses,
  { poll = true }: BlockchainActivityFeedOptions = {}
): BlockchainActivityFeed {
  const settings = useUserSettings();

  const feedQuery = useInfiniteQuery({
    ...createBlockchainActivityInfiniteQueryConfig({ account, limit: feedPageSize }, settings),
    refetchInterval(query) {
      if (!poll) return false;
      const pageCount = query.state.data?.pages.length ?? 1;
      return pageCount <= feedRefetchMaxPages ? feedRefetchInterval : false;
    },
    select: selectBlockchainActivityFeedItems,
  });

  return {
    items: feedQuery.data ?? [],
    isLoading: feedQuery.isLoading,
    isError: feedQuery.isError,
    isSuccess: feedQuery.isSuccess,
    isRefetchError: feedQuery.isRefetchError,
    isFetchNextPageError: feedQuery.isFetchNextPageError,
    hasNextPage: feedQuery.hasNextPage,
    isFetchingNextPage: feedQuery.isFetchingNextPage,
    fetchNextPage: () => void feedQuery.fetchNextPage(),
    refetch: () => void feedQuery.refetch(),
  };
}
