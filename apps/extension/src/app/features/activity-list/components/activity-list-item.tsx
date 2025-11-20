import { memo } from 'react';

import { Flex, styled } from 'leather-styles/jsx';

import {
  type ActivityLinkClickHandler,
  formatActivityCaption,
  formatActivityStatusLabel,
  getBalancesText,
} from '@leather.io/features';
import { type OnChainActivity } from '@leather.io/models';
import { ActivityAvatarIcon } from '@leather.io/ui';

interface ListItemProps {
  activity: OnChainActivity;
  activityLink?: string | null;
  onActivityLinkClick?: ActivityLinkClickHandler;
}

function ListItem({ activity, activityLink, onActivityLinkClick }: ListItemProps) {
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
export const ActivityListItem = memo(ListItem);
