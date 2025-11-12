import { Box, Flex, styled } from 'leather-styles/jsx';
import { useStacksNetwork } from '~/store/stacks-network';
import { openExternalLink } from '~/utils/external-links';

import { HIRO_EXPLORER_URL } from '@leather.io/constants';
import { type OnChainActivity, makeActivityLink } from '@leather.io/models';
import { ActivityAvatarIcon } from '@leather.io/ui';

import { formatActivityCaption, formatActivityStatusLabel, getBalancesText } from './utils';

interface ActivityItemProps {
  activity: OnChainActivity;
}

export function ActivityItem({ activity }: ActivityItemProps) {
  const { formattedBalanceCrypto, formattedBalanceQuote } = getBalancesText(activity);
  const { networkPreference } = useStacksNetwork();
  const activityLink =
    'asset' in activity
      ? makeActivityLink({
          txid: activity.txid,
          networkPreference,
          asset: activity.asset,
          explorerUrl: HIRO_EXPLORER_URL,
        })
      : null;

  return (
    <styled.button
      cursor={activityLink ? 'pointer' : 'default'}
      display="flex"
      flexDirection="column"
      width="100%"
      onClick={() => {
        if (!activityLink) return;
        openExternalLink(activityLink);
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
          <Box>
            <ActivityAvatarIcon activity={activity} />
          </Box>
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
