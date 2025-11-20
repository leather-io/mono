import { Virtuoso } from 'react-virtuoso';

import { Flex, Stack, styled } from 'leather-styles/jsx';

import { type OnChainActivity } from '@leather.io/models';
import { LoadingSpinner } from '@leather.io/ui';

import {
  ActivityItem,
  type ActivityItemProps,
  type ActivityLinkClickHandler,
} from './activity-item.web';

export type GetActivityLink = (activity: OnChainActivity) => string | null | undefined;

export interface ActivityListProps {
  activity: OnChainActivity[];
  isLoading: boolean;
  getActivityLink?: GetActivityLink;
  onActivityLinkClick?: ActivityLinkClickHandler;
  minWidth?: string | number;
}

export function ActivityList({
  activity,
  isLoading,
  getActivityLink,
  onActivityLinkClick,
  minWidth = 400,
}: ActivityListProps) {
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

  function getItemProps(activityItem: OnChainActivity): Pick<ActivityItemProps, 'activityLink'> {
    if (!getActivityLink) return { activityLink: null };
    return { activityLink: getActivityLink(activityItem) ?? null };
  }

  return (
    <Stack minWidth={minWidth} flexGrow={1} position="relative">
      <Virtuoso
        data={activity}
        itemContent={(_, activityItem) => (
          <ActivityItem
            key={activityItem.txid}
            activity={activityItem}
            {...getItemProps(activityItem)}
            onActivityLinkClick={onActivityLinkClick}
          />
        )}
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
