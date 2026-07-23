import type { InfiniteData } from '@tanstack/react-query';
import { formatCurrency } from '~/utils/currency-formatter';

import { type BlockchainActivityView, createBlockchainActivityView } from '@leather.io/features';
import type { AccountAddresses, BlockchainActivity, Money } from '@leather.io/models';
import {
  createBlockchainActivityByTxIdQueryConfig,
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

// Compact counterparty display in the web activity feeds: first/last three
// characters (e.g. SP3…P2H). Extension and mobile keep truncateMiddle's default.
export const activityCounterpartyOffset = 3;

function selectBlockchainActivityViews(response: ActivityResponse) {
  return response.items.map(item =>
    createBlockchainActivityView(item, {
      formatMoney: formatActivityMoney,
      counterpartyTruncateOffset: activityCounterpartyOffset,
    })
  );
}

function selectBlockchainActivityFeedViews(data: InfiniteData<ActivityResponse>) {
  return data.pages.flatMap(page =>
    page.items.map(item =>
      createBlockchainActivityView(item, {
        formatMoney: formatActivityMoney,
        counterpartyTruncateOffset: activityCounterpartyOffset,
      })
    )
  );
}

interface BlockchainActivityDetail {
  activity: BlockchainActivity;
  view: BlockchainActivityView;
}

function selectBlockchainActivityDetail(
  activity: BlockchainActivity | null
): BlockchainActivityDetail | null {
  return activity === null
    ? null
    : {
        activity,
        view: createBlockchainActivityView(activity, {
          formatMoney: formatActivityMoney,
          counterpartyTruncateOffset: activityCounterpartyOffset,
        }),
      };
}

export function createBlockchainActivityByTxIdDetailQuery(
  account: AccountAddresses,
  txid: string,
  settings: UserSettings
) {
  return {
    ...createBlockchainActivityByTxIdQueryConfig(account, txid, settings),
    ...activityFeedCacheOptions,
    select: selectBlockchainActivityDetail,
  };
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
