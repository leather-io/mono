import {
  type InfiniteData,
  type QueryClient,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { formatCurrency } from '~/utils/currency-formatter';

import {
  type BlockchainActivityItem,
  type BlockchainActivityViewDeps,
  createBlockchainActivityItem,
  createBlockchainActivityViews,
} from '@leather.io/features';
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

const activityViewDeps: BlockchainActivityViewDeps = {
  formatMoney: formatActivityMoney,
  counterpartyTruncateOffset: activityCounterpartyOffset,
};

function selectBlockchainActivityViews(response: ActivityResponse) {
  return createBlockchainActivityViews(response.items, activityViewDeps);
}

function selectBlockchainActivityFeedViews(data: InfiniteData<ActivityResponse>) {
  return createBlockchainActivityViews(
    data.pages.flatMap(page => page.items),
    activityViewDeps
  );
}

function selectBlockchainActivityDetail(
  activity: BlockchainActivity | null
): BlockchainActivityItem | null {
  return activity === null ? null : createBlockchainActivityItem(activity, activityViewDeps);
}

function seedableActivityCacheKeys(account: AccountAddresses) {
  return [
    ['blockchain-activity-service--get-activity', { account }],
    ['blockchain-activity-service--get-activity-infinite', { account }],
    ['blockchain-activity-service--get-activity-by-asset-id', account],
  ];
}

function normalizeCachedTxid(txid: string) {
  return txid.toLowerCase().replace(/^0x/, '');
}

function isBlockchainActivity(value: unknown): value is BlockchainActivity {
  return (
    typeof value === 'object' &&
    value !== null &&
    'txid' in value &&
    'balanceChanges' in value &&
    'chain' in value
  );
}

function extractCachedActivities(data: unknown): BlockchainActivity[] {
  if (Array.isArray(data)) return data.filter(isBlockchainActivity);
  if (typeof data !== 'object' || data === null) return [];
  if ('pages' in data && Array.isArray(data.pages))
    return data.pages.flatMap(extractCachedActivities);
  if ('items' in data && Array.isArray(data.items)) return data.items.filter(isBlockchainActivity);
  return [];
}

interface CachedBlockchainActivityLookup {
  activity: BlockchainActivity;
  dataUpdatedAt: number;
}

export function findCachedBlockchainActivityByTxid(
  queryClient: QueryClient,
  account: AccountAddresses,
  txid: string
): CachedBlockchainActivityLookup | undefined {
  if (!txid) return undefined;
  const target = normalizeCachedTxid(txid);
  let freshest: CachedBlockchainActivityLookup | undefined;
  for (const queryKey of seedableActivityCacheKeys(account)) {
    for (const query of queryClient.getQueryCache().findAll({ queryKey })) {
      if (freshest && query.state.dataUpdatedAt <= freshest.dataUpdatedAt) continue;
      const activity = extractCachedActivities(query.state.data).find(
        item => normalizeCachedTxid(item.txid) === target
      );
      if (activity) freshest = { activity, dataUpdatedAt: query.state.dataUpdatedAt };
    }
  }
  return freshest;
}

export function useBlockchainActivityByTxIdDetailQuery(
  account: AccountAddresses,
  txid: string,
  settings: UserSettings,
  enabled: boolean
) {
  const queryClient = useQueryClient();
  return useQuery({
    ...createBlockchainActivityByTxIdQueryConfig(account, txid, settings),
    ...activityFeedCacheOptions,
    select: selectBlockchainActivityDetail,
    initialData: () => findCachedBlockchainActivityByTxid(queryClient, account, txid)?.activity,
    initialDataUpdatedAt: () =>
      findCachedBlockchainActivityByTxid(queryClient, account, txid)?.dataUpdatedAt,
    enabled,
  });
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
