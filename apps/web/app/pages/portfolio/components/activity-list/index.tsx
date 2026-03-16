import { useCallback } from 'react';
import { Virtuoso } from 'react-virtuoso';

import { Flex, Stack, styled } from 'leather-styles/jsx';

import { type ActivityView } from '@leather.io/features';
import { LoadingSpinner } from '@leather.io/ui';

import { ActivityItem } from './activity-item';

interface ActivityListProps {
  activity: ActivityView[];
  isLoading: boolean;
  minWidth?: string | number;
}

export function ActivityList({ activity, isLoading, minWidth = 400 }: ActivityListProps) {
  const itemContent = useCallback(
    (_: number, item: ActivityView) => <ActivityItem item={item} />,
    []
  );

  const computeItemKey = useCallback((_: number, item: ActivityView) => item.key, []);
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
        color="ink.text-subdued-primary"
      >
        No recent activity
      </Flex>
    );
  }

  return (
    <Stack minWidth={minWidth} flexGrow={1} position="relative">
      <Virtuoso data={activity} computeItemKey={computeItemKey} itemContent={itemContent} />
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
