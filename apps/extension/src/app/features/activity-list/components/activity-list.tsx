import { useCallback } from 'react';
import { Virtuoso } from 'react-virtuoso';

import { Flex, Stack, styled } from 'leather-styles/jsx';

import { type ActivityLinkClickHandler, type GetActivityLink } from '@leather.io/features';
import { type OnChainActivity } from '@leather.io/models';
import { LoadingSpinner } from '@leather.io/ui';

import { ActivityListItem } from './activity-list-item';

interface ActivityListProps {
  activity: OnChainActivity[];
  isLoading: boolean;
  getActivityLink?: GetActivityLink;
  onActivityLinkClick?: ActivityLinkClickHandler;
  minWidth?: string | number;
  onLoadMore?(): void;
  isLoadingMore?: boolean;
  useWindowScroll?: boolean;
}

export function ActivityList({
  activity,
  isLoading,
  getActivityLink,
  onActivityLinkClick,
  minWidth = 400,
  onLoadMore,
  isLoadingMore = false,
  useWindowScroll = false,
}: ActivityListProps) {
  const getItemProps = useCallback(
    (activityItem: OnChainActivity) => ({
      activityLink: getActivityLink?.(activityItem) ?? null,
    }),
    [getActivityLink]
  );
  const handleEndReached = useCallback(() => {
    if (!isLoading && !isLoadingMore) onLoadMore?.();
  }, [isLoading, isLoadingMore, onLoadMore]);
  const renderItem = useCallback(
    (_index: number, activityItem: OnChainActivity) => (
      <ActivityListItem
        activity={activityItem}
        {...getItemProps(activityItem)}
        onActivityLinkClick={onActivityLinkClick}
      />
    ),
    [getItemProps, onActivityLinkClick]
  );
  const computeItemKey = useCallback(
    (_index: number, activityItem: OnChainActivity) => activityItem.txid,
    []
  );

  const virtuosoStyle = useWindowScroll ? undefined : { height: '100%' };

  if (isLoading) {
    return (
      <Stack flexGrow={1} position="relative">
        <Flex p="space.06" textAlign="center" fontSize="24px" justifyContent="center" flexGrow={1}>
          <LoadingSpinner />
        </Flex>
      </Stack>
    );
  }
  if (activity.length === 0) {
    return (
      <Flex
        p="space.06"
        textAlign="center"
        justifyContent="center"
        flexGrow={1}
        textStyle="body.02"
        color="ink.text-subdued"
      >
        No recent activity
      </Flex>
    );
  }
  return (
    <Stack
      minWidth={minWidth}
      flexGrow={1}
      minHeight={useWindowScroll ? undefined : 0}
      height={useWindowScroll ? undefined : '100%'}
      position="relative"
    >
      <Virtuoso
        style={virtuosoStyle}
        data={activity}
        itemContent={renderItem}
        computeItemKey={computeItemKey}
        endReached={handleEndReached}
        overscan={200}
        useWindowScroll={useWindowScroll}
        components={{
          Footer: () =>
            isLoadingMore ? (
              <Flex justifyContent="center" py="space.04">
                <LoadingSpinner />
              </Flex>
            ) : null,
        }}
      />
      <styled.div
        position="absolute"
        bottom="0"
        left="0"
        right="0"
        height="48px"
        bgGradient="to-t"
        gradientFrom="ink.background-primary"
        gradientTo="transparent"
      />
    </Stack>
  );
}
