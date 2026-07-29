import { useCallback, useMemo } from 'react';
import { GroupedVirtuoso } from 'react-virtuoso';

import { groupActivityByDate } from '@leather.io/features';

import { useBlockchainActivityFeed } from '@app/query/activity/blockchain-activity.query';
import { useCurrentAccountAddresses } from '@app/services/accounts/use-account-addresses';

import { mergeSbtcDepositItems } from './activity-list.utils';
import { ActivityGroupHeader } from './components/activity-group-header';
import { ActivityListLayout } from './components/activity-list.layout';
import { ActivityLoadMoreError } from './components/activity-load-more-error';
import { ActivityLoadingMore } from './components/activity-loading-more';
import { ActivityRow } from './components/activity-row';
import { useSbtcDepositActivity } from './use-sbtc-deposit-activity';

export function ActivityList() {
  const accountAddresses = useCurrentAccountAddresses();
  const {
    items,
    isLoading,
    isError,
    isRefetchError,
    isFetchNextPageError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = useBlockchainActivityFeed(accountAddresses);

  const feedTxids = useMemo(() => new Set(items.map(item => item.view.txid)), [items]);
  const { overlays: sbtcOverlays, standaloneItems: sbtcItems } = useSbtcDepositActivity(feedTxids);

  const activityItems = useMemo(() => mergeSbtcDepositItems(items, sbtcItems), [items, sbtcItems]);

  const groups = useMemo(
    () =>
      groupActivityByDate(activityItems, {
        getTimestamp: item => item.view.timestamp,
        isPending: item => item.view.status === 'pending',
      }),
    [activityItems]
  );

  const groupCounts = useMemo(() => groups.map(group => group.items.length), [groups]);
  const flatItems = useMemo(() => groups.flatMap(group => group.items), [groups]);

  const groupContent = useCallback(
    (index: number) => <ActivityGroupHeader label={groups[index].label} />,
    [groups]
  );

  const itemContent = useCallback(
    (index: number) => {
      const item = flatItems[index];
      return <ActivityRow item={item} sbtcOverlay={sbtcOverlays.get(item.view.txid)} />;
    },
    [flatItems, sbtcOverlays]
  );

  const endReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const components = useMemo(
    () => ({
      Footer() {
        if (isFetchingNextPage) return <ActivityLoadingMore />;
        if (isFetchNextPageError) return <ActivityLoadMoreError onRetry={fetchNextPage} />;
        return null;
      },
    }),
    [isFetchingNextPage, isFetchNextPageError, fetchNextPage]
  );

  return (
    <ActivityListLayout
      isLoading={isLoading}
      isError={isError}
      isRefetchError={isRefetchError}
      hasActivity={activityItems.length > 0}
      onRetry={refetch}
    >
      <GroupedVirtuoso
        style={{ height: '100%' }}
        groupCounts={groupCounts}
        groupContent={groupContent}
        itemContent={itemContent}
        components={components}
        endReached={endReached}
        overscan={200}
        useWindowScroll
      />
    </ActivityListLayout>
  );
}
