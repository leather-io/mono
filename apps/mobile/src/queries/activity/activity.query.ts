import { toFetchState } from '@/components/loading/fetch-state';
import { useAccountAddresses } from '@/hooks/use-account-addresses';
import { useSettings } from '@/store/settings/settings';
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
} from '@leather.io/queries';
import type { ActivityResponse, UserSettings } from '@leather.io/services';
import type { FormatAmountOptions } from '@leather.io/utils';

import { retriableActivityQueryOptions } from './activity-query-options';

const feedPageSize = 25;

function formatActivityMoney(money: Money, options?: FormatAmountOptions) {
  return formatCurrency(money, { ...options, showCurrency: false });
}

const activityViewDeps: BlockchainActivityViewDeps = { formatMoney: formatActivityMoney };

function selectActivityFeedItems(data: InfiniteData<ActivityResponse>) {
  return createBlockchainActivityItems(
    data.pages.flatMap(page => page.items),
    activityViewDeps
  );
}

function selectActivityItems(activities: BlockchainActivity[]) {
  return createBlockchainActivityItems(activities, activityViewDeps);
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
  const feedQuery = useInfiniteQuery({
    ...createBlockchainActivityInfiniteQueryConfig({ account, limit: feedPageSize }, settings),
    ...retriableActivityQueryOptions,
    select: selectActivityFeedItems,
  });

  return {
    activity: toFetchState(feedQuery),
    hasNextPage: feedQuery.hasNextPage,
    isFetchingNextPage: feedQuery.isFetchingNextPage,
    fetchNextPage() {
      void feedQuery.fetchNextPage();
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
  return toFetchState(
    useActivityByAssetIdQuery(fingerprint, accountIndex, assetId, selectActivityItems)
  );
}
