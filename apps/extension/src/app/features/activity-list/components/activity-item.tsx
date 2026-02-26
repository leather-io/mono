import { memo } from 'react';

import { Flex, styled } from 'leather-styles/jsx';

import { type ActivityView } from '@leather.io/features';
import { Money } from '@leather.io/models';
import { ActivityAvatarIcon } from '@leather.io/ui';
import { type FormatAmountOptions } from '@leather.io/utils';

import { openInNewTab } from '@app/common/utils/open-in-new-tab';
import { Balance } from '@app/components/balance/balance';

interface ActivityItemProps {
  item: ActivityView;
  action?: React.ReactNode;
  formatCurrency(money: Money, options?: FormatAmountOptions): string;
}

export const ActivityItem = memo(function ActivityItem({
  item,
  action,
  formatCurrency,
}: ActivityItemProps) {
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
      onClick={activityLink ? () => openInNewTab(activityLink) : undefined}
    >
      <Flex
        justifyContent="space-between"
        alignItems="center"
        py="space.03"
        px="space.05"
        _hover={
          clickable
            ? {
                bg: 'ink.component-background-hover',
              }
            : undefined
        }
      >
        <Flex alignItems="center" gap="space.04" minWidth={0} flex={1}>
          <ActivityAvatarIcon activity={item} />
          <Flex flexDirection="column" alignItems="flex-start" minWidth={0}>
            <styled.p textStyle="body.02" fontWeight="medium" truncate>
              {title}
            </styled.p>
            <styled.p textStyle="caption.01" color="ink.text-subdued" truncate>
              {caption}
            </styled.p>
          </Flex>
        </Flex>

        <Flex alignItems="flex-end" flexDir="column" gap="space.01" flexShrink={0}>
          {balances.quote ? (
            <Balance
              balance={balances.quote}
              operator={balances.operator}
              color={balances.color}
              textStyle="label.02"
              formatCurrency={formatCurrency}
            />
          ) : null}
          {balances.crypto ? (
            <Balance
              balance={balances.crypto}
              formattingOptions={{ showCurrency: false }}
              color="ink.text-subdued"
              textStyle="caption.01"
              formatCurrency={formatCurrency}
            />
          ) : null}
          {action}
        </Flex>
      </Flex>
    </styled.button>
  );
});
