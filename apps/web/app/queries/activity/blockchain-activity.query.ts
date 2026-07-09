import type { InfiniteData } from '@tanstack/react-query';
import { formatCurrency } from '~/utils/currency-formatter';

import { createBlockchainActivityView } from '@leather.io/features';
import type { AccountAddresses, Money } from '@leather.io/models';
import {
  createBlockchainActivityInfiniteQueryConfig,
  createBlockchainActivityQueryConfig,
} from '@leather.io/queries';
import type { ActivityResponse, UserSettings } from '@leather.io/services';
import type { FormatAmountOptions } from '@leather.io/utils';

const activityFeedCacheOptions = {
  refetchOnMount: true,
  staleTime: 30_000,
  gcTime: 300_000,
} as const;

export function formatActivityMoney(money: Money, options?: FormatAmountOptions) {
  return formatCurrency(money, { ...options, showCurrency: false });
}

function selectBlockchainActivityViews(response: ActivityResponse) {
  return response.items.map(item =>
    createBlockchainActivityView(item, { formatMoney: formatActivityMoney })
  );
}

function selectBlockchainActivityFeedViews(data: InfiniteData<ActivityResponse>) {
  return data.pages.flatMap(page =>
    page.items.map(item => createBlockchainActivityView(item, { formatMoney: formatActivityMoney }))
  );
}

export function createBlockchainActivityViewsQuery(
  account: AccountAddresses,
  settings: UserSettings,
  limit?: number
) {
  return {
    ...createBlockchainActivityQueryConfig({ account, limit }, settings),
    ...activityFeedCacheOptions,
    select: selectBlockchainActivityViews,
  };
}

export function createBlockchainActivityViewsFeedQuery(
  account: AccountAddresses,
  settings: UserSettings,
  limit?: number
) {
  return {
    ...createBlockchainActivityInfiniteQueryConfig({ account, limit }, settings),
    ...activityFeedCacheOptions,
    select: selectBlockchainActivityFeedViews,
  };
}
