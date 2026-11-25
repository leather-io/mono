import { useCallback, useEffect } from 'react';

import { toFetchState } from '@/components/loading/fetch-state';
import { defaultMask } from '@/components/private-text';
import { useAccountAddresses } from '@/hooks/use-account-addresses';
import { useSettings } from '@/store/settings/settings';
import { usePrivacyMode } from '@/store/settings/settings.read';
import { formatCurrency } from '@/utils/currency-formatter';
import { type InfiniteData, useInfiniteQuery, useQuery } from '@tanstack/react-query';

import {
  type BlockchainActivityViewDeps,
  createBlockchainActivityItems,
} from '@leather.io/features';
import type { BlockchainActivity, CryptoAssetId, Money } from '@leather.io/models';
import {
  createBlockchainActivityByAssetIdQueryConfig,
  createBlockchainActivityInfiniteQueryConfig,
  isActivityFeedTailEmpty,
} from '@leather.io/queries';
import type { ActivityResponse, UserSettings } from '@leather.io/services';
import type { FormatAmountOptions } from '@leather.io/utils';

import { retriableActivityQueryOptions } from './activity-query-options';

const feedPageSize = 25;

function formatActivityMoney(money: Money, options?: FormatAmountOptions) {
  return formatCurrency(money, { ...options, showCurrency: false });
}

function maskActivityMoney() {
  return defaultMask;
}

const activityViewDeps: BlockchainActivityViewDeps = { formatMoney: formatActivityMoney };
const privateActivityViewDeps: BlockchainActivityViewDeps = { formatMoney: maskActivityMoney };

function useActivityViewDeps() {
  return usePrivacyMode() ? privateActivityViewDeps : activityViewDeps;
}

function useActivitySettings(): UserSettings {
  const { networkPreference, fiatCurrencyPreference, assetVisibility } = useSettings();
  return {
    network: networkPreference,
    quoteCurrency: fiatCurrencyPreference,
    assetVisibility,
  };
}

export function useActivityFeed(fingerprint: string, accountIndex: number) {
  const account = useAccountAddresses(fingerprint, accountIndex);
  const settings = useActivitySettings();
  const viewDeps = useActivityViewDeps();
  const selectActivityFeedItems = useCallback(
    (data: InfiniteData<ActivityResponse>) => ({
      items: createBlockchainActivityItems(
        data.pages.flatMap(page => page.items),
        viewDeps
      ),
      isTailEmpty: isActivityFeedTailEmpty(data),
    }),
    [viewDeps]
  );
  const feedQuery = useInfiniteQuery({
    ...createBlockchainActivityInfiniteQueryConfig({ account, limit: feedPageSize }, settings),
    ...retriableActivityQueryOptions,
    select: selectActivityFeedItems,
  });
  const { fetchNextPage, refetch, isFetching, isFetchNextPageError } = feedQuery;
  const isTailEmpty = feedQuery.data?.isTailEmpty ?? false;
  useEffect(() => {
    if (isTailEmpty && !isFetching && !isFetchNextPageError) void fetchNextPage();
  }, [isTailEmpty, isFetching, isFetchNextPageError, fetchNextPage]);
  const isSearchingActivity =
    feedQuery.data?.items.length === 0 && isTailEmpty && !isFetchNextPageError;

  return {
    activity: toFetchState({
      data: feedQuery.data?.items,
      isLoading: feedQuery.isLoading || isSearchingActivity,
      isError: feedQuery.isError && feedQuery.data === undefined,
      error: feedQuery.error,
    }),
    hasNextPage: feedQuery.hasNextPage,
    isFetchingNextPage: feedQuery.isFetchingNextPage,
    fetchNextPage() {
      void fetchNextPage();
    },
    refetch() {
      void refetch();
    },
  };
}

export function useActivityByAssetIdQuery<T>(
  fingerprint: string,
  accountIndex: number,
  assetId: CryptoAssetId,
  select: (activities: BlockchainActivity[]) => T
) {
  const account = useAccountAddresses(fingerprint, accountIndex);
  const settings = useActivitySettings();
  return useQuery({
    ...createBlockchainActivityByAssetIdQueryConfig(account, assetId, settings),
    ...retriableActivityQueryOptions,
    select,
  });
}

export function useActivityByAssetId(
  fingerprint: string,
  accountIndex: number,
  assetId: CryptoAssetId
) {
  const viewDeps = useActivityViewDeps();
  const selectActivityItems = useCallback(
    (activities: BlockchainActivity[]) => createBlockchainActivityItems(activities, viewDeps),
    [viewDeps]
  );
  return toFetchState(
    useActivityByAssetIdQuery(fingerprint, accountIndex, assetId, selectActivityItems)
  );
}
