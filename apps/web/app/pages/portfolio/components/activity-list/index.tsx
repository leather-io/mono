import { Virtuoso } from 'react-virtuoso';

import { Flex, Stack, styled } from 'leather-styles/jsx';

import { type OnChainActivity } from '@leather.io/models';
import { LoadingSpinner } from '@leather.io/ui';

import { ActivityItem } from './activity-item';

interface ActivityListProps {
  isLoading: boolean;
  activity: OnChainActivity[];
}

export function ActivityList({ activity, isLoading }: ActivityListProps) {
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
    <Stack minWidth={400} flexGrow={1} position="relative">
      <Virtuoso
        data={activity}
        itemContent={(_, activityItem) => (
          <ActivityItem key={activityItem.txid} activity={activityItem} />
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
