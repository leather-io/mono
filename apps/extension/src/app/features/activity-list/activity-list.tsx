import { useCallback, useMemo } from 'react';
import { GroupedVirtuoso } from 'react-virtuoso';

import { groupActivityByDate } from '@leather.io/features';

import { useBlockchainActivityFeed } from '@app/query/activity/blockchain-activity.query';
import { useCurrentAccountAddresses } from '@app/services/accounts/use-account-addresses';

import { ActivityGroupHeader } from './components/activity-group-header';
import { ActivityListLayout } from './components/activity-list.layout';
import { ActivityLoadingMore } from './components/activity-loading-more';
import { ActivityRow } from './components/activity-row';
import { useSbtcDepositOverlays } from './use-sbtc-deposit-overlay';

export function ActivityList() {
  const accountAddresses = useCurrentAccountAddresses();
  const { items, isLoading, isError, hasNextPage, isFetchingNextPage, fetchNextPage, refetch } =
    useBlockchainActivityFeed(accountAddresses);
  const sbtcOverlays = useSbtcDepositOverlays();

  const groups = useMemo(
    () => groupActivityByDate(items, { getTimestamp: item => item.view.timestamp }),
    [items]
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
    () => ({ Footer: () => (isFetchingNextPage ? <ActivityLoadingMore /> : null) }),
    [isFetchingNextPage]
  );

  return (
    <ActivityListLayout
      isLoading={isLoading}
      isError={isError}
      hasActivity={items.length > 0}
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
