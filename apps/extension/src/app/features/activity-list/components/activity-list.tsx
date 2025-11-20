import { Virtuoso } from 'react-virtuoso';

import { Flex, Stack, styled } from 'leather-styles/jsx';

import {
  type ActivityLinkClickHandler,
  type GetActivityLink,
  formatActivityCaption,
  formatActivityStatusLabel,
  getBalancesText,
} from '@leather.io/features';
import { type OnChainActivity } from '@leather.io/models';
import { ActivityAvatarIcon, LoadingSpinner } from '@leather.io/ui';

interface ActivityItemProps {
  activity: OnChainActivity;
  activityLink?: string | null;
  onActivityLinkClick?: ActivityLinkClickHandler;
}

function ActivityItem({ activity, activityLink, onActivityLinkClick }: ActivityItemProps) {
  const { formattedBalanceCrypto, formattedBalanceQuote } = getBalancesText(activity);
  const clickable = Boolean(activityLink);

  return (
    <styled.button
      type="button"
      cursor={clickable ? 'pointer' : 'default'}
      display="flex"
      flexDirection="column"
      width="100%"
      disabled={!clickable}
      onClick={() => {
        if (!activityLink) return;
        onActivityLinkClick?.(activityLink, activity);
      }}
    >
      <Flex
        justifyContent="space-between"
        alignItems="center"
        py="space.03"
        px="space.05"
        _hover={{
          bg: 'ink.component-background-hover',
        }}
      >
        <Flex alignItems="center" gap="space.04">
          <ActivityAvatarIcon activity={activity} />
          <Flex flexDirection="column" alignItems="flex-start">
            <styled.p textStyle="body.02" fontWeight="medium">
              {formatActivityStatusLabel(activity)}
            </styled.p>
            <styled.p textStyle="caption.01" color="ink.text-subdued">
              {formatActivityCaption(activity)}
            </styled.p>
          </Flex>
        </Flex>

        <Flex alignItems="flex-end" flexDir="column" gap="space.01">
          <styled.p textStyle="body.02">{formattedBalanceCrypto}</styled.p>
          <Flex alignItems="center" gap="space.02">
            <styled.span textStyle="caption.01" color="ink.text-subdued">
              {formattedBalanceQuote}
            </styled.span>
          </Flex>
        </Flex>
      </Flex>
    </styled.button>
  );
}

interface ActivityListProps {
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

  function getItemProps(activityItem: OnChainActivity) {
    const activityLink = getActivityLink?.(activityItem) ?? null;
    return { activityLink };
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
