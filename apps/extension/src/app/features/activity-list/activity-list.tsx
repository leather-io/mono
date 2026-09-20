import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useNavigationType } from 'react-router';
import { GroupedVirtuoso, type GroupedVirtuosoHandle, type StateSnapshot } from 'react-virtuoso';

import { Box } from 'leather-styles/jsx';

import { groupActivityByDate } from '@leather.io/features';

import { useUserSettings } from '@app/hooks/use-user-settings';
import { useBlockchainActivityFeed } from '@app/query/activity/blockchain-activity.query';
import { useCurrentAccountAddresses } from '@app/services/accounts/use-account-addresses';

import { mergeSbtcDepositItems } from './activity-list.utils';
import { ActivityGroupHeader } from './components/activity-group-header';
import { ActivityListLayout } from './components/activity-list.layout';
import { ActivityLoadMoreError } from './components/activity-load-more-error';
import { ActivityLoadingMore } from './components/activity-loading-more';
import { ActivityRow } from './components/activity-row';
import { useSbtcDepositActivity } from './use-sbtc-deposit-activity';

interface SavedListState {
  snapshot: StateSnapshot;
  listHeight: number;
  scrollY: number;
}

interface HeldLayout {
  minHeight: number;
  scrollY: number;
  snapshot?: StateSnapshot;
}

const listStateByAccount = new Map<string, SavedListState>();
const estimatedRowHeight = 72;

export function ActivityList() {
  const accountAddresses = useCurrentAccountAddresses();
  const { network } = useUserSettings();
  const listStateKey = `${network.id}:${accountAddresses.id.fingerprint}:${accountAddresses.id.accountIndex}`;
  const virtuosoRef = useRef<GroupedVirtuosoHandle>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const isReturning = useNavigationType() === 'POP';
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
  const isStandaloneDeposit = useCallback(
    (bitcoinTxid: string) => !feedTxids.has(bitcoinTxid),
    [feedTxids]
  );
  const { overlays: sbtcOverlays, standaloneItems: sbtcItems } =
    useSbtcDepositActivity(isStandaloneDeposit);

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

  const [heldLayout, setHeldLayout] = useState<HeldLayout | undefined>(() => {
    const saved = listStateByAccount.get(listStateKey);
    if (isReturning && saved) {
      return { minHeight: saved.listHeight, scrollY: saved.scrollY, snapshot: saved.snapshot };
    }
    const estimatedHeight = (flatItems.length + groups.length) * estimatedRowHeight;
    return { minHeight: saved?.listHeight ?? estimatedHeight, scrollY: window.scrollY };
  });

  useLayoutEffect(() => {
    if (heldLayout) window.scrollTo(0, heldLayout.scrollY);
  }, [heldLayout]);

  const releaseHeldLayout = useCallback((listHeight: number) => {
    if (listHeight > 0) setHeldLayout(current => (current ? undefined : current));
  }, []);

  const groupContent = useCallback(
    (index: number) => (
      <ActivityGroupHeader label={groups[index].label} isFirstGroup={index === 0} />
    ),
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

  const saveListState = useCallback(
    (isScrolling: boolean) => {
      if (isScrolling) return;
      virtuosoRef.current?.getState(snapshot =>
        listStateByAccount.set(listStateKey, {
          snapshot,
          listHeight: listRef.current?.offsetHeight ?? 0,
          scrollY: window.scrollY,
        })
      );
    },
    [listStateKey]
  );

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
      <Box
        ref={listRef}
        style={heldLayout ? { minHeight: `${heldLayout.minHeight}px` } : undefined}
      >
        <GroupedVirtuoso
          ref={virtuosoRef}
          style={{ height: '100%' }}
          restoreStateFrom={heldLayout?.snapshot}
          totalListHeightChanged={releaseHeldLayout}
          isScrolling={saveListState}
          groupCounts={groupCounts}
          groupContent={groupContent}
          itemContent={itemContent}
          components={components}
          endReached={endReached}
          overscan={200}
          useWindowScroll
        />
      </Box>
    </ActivityListLayout>
  );
}
