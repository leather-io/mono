import { memo } from 'react';

import { Box, Flex, styled } from 'leather-styles/jsx';
import { Balance } from '~/components/balance/balance';
import { formatCurrency } from '~/utils/currency-formatter';
import { openExternalLink } from '~/utils/external-links';

import { type ActivityView } from '@leather.io/features';
import { ActivityAvatarIcon } from '@leather.io/ui';

interface ActivityItemProps {
  item: ActivityView;
}
function ActivityItemComponent({ item }: ActivityItemProps) {
  const { activityLink, title, caption, balances } = item;
  const clickable = Boolean(activityLink);

  return (
    <styled.button
      type="button"
      cursor={clickable ? 'pointer' : 'default'}
      display="flex"
      flexDirection="column"
      width="100%"
      disabled={!clickable}
      onClick={activityLink ? () => openExternalLink(activityLink) : undefined}
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
            <ActivityAvatarIcon activity={item} />
          </Box>
          <Flex flexDirection="column" alignItems="flex-start">
            <styled.p textStyle="body.02" fontWeight="medium">
              {title}
            </styled.p>
            <styled.p textStyle="caption.01" color="ink.text-subdued">
              {caption}
            </styled.p>
          </Flex>
        </Flex>

        <Flex alignItems="flex-end" flexDir="column" gap="space.01">
          {balances.quote ? (
            <Balance
              balance={balances.quote}
              operator={balances.operator}
              color={balances.color}
              textStyle="body.02"
              formatCurrency={formatCurrency}
            />
          ) : null}
          {balances.crypto ? (
            <Balance
              balance={balances.crypto}
              formattingOptions={{ showCurrency: false }}
              textStyle="caption.01"
              color="ink.text-subdued"
              formatCurrency={formatCurrency}
            />
          ) : null}
        </Flex>
      </Flex>
    </styled.button>
  );
}

export const ActivityItem = memo(ActivityItemComponent);
