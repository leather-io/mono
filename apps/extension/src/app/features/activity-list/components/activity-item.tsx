import { memo } from 'react';

import { Flex, styled } from 'leather-styles/jsx';

import { type ActivityView } from '@leather.io/features';
import { Money } from '@leather.io/models';
import { ActivityAvatarIcon } from '@leather.io/ui';
import { type FormatAmountOptions } from '@leather.io/utils';

import { openInNewTab } from '@app/common/utils/open-in-new-tab';
import { Balance } from '@app/components/balance/balance';

interface ItemProps {
  item: ActivityView;
  formatCurrency(money: Money, options?: FormatAmountOptions): string;
}

function Item({ item, formatCurrency }: ItemProps) {
  const { activityLink, title, caption, balances, statusLabel, activityAvatar, statusIndicator } =
    item;
  const clickable = Boolean(activityLink);

  const normalizedStatusLabel = statusLabel?.trim() ?? '';

  const titleText = normalizedStatusLabel || title;

  const timestampText =
    normalizedStatusLabel && caption.startsWith(normalizedStatusLabel)
      ? caption.slice(normalizedStatusLabel.length).trim()
      : caption;
  function getSwapStatusText(statusIndicator: string): string {
    switch (statusIndicator) {
      case 'pending':
        return 'Swapping';
      case 'failed':
        return 'Swap failed';
      case 'swap':
        return 'Swapped';
      default:
        return '';
    }
  }

  const swapStatusText = getSwapStatusText(statusIndicator);

  const captionText =
    activityAvatar === 'swap' && !!swapStatusText
      ? `${swapStatusText} ${timestampText}`
      : timestampText;

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
        <Flex alignItems="center" gap="space.04">
          <ActivityAvatarIcon activity={item} />
          <Flex flexDirection="column" alignItems="flex-start">
            <styled.p textStyle="body.02" fontWeight="medium">
              {titleText}
            </styled.p>
            <styled.p textStyle="caption.01" color="ink.text-subdued-primary">
              {captionText}
            </styled.p>
          </Flex>
        </Flex>

        <Flex alignItems="flex-end" flexDir="column" gap="space.01">
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
              color="ink.text-subdued-primary"
              textStyle="caption.01"
              formatCurrency={formatCurrency}
            />
          ) : null}
        </Flex>
      </Flex>
    </styled.button>
  );
}
export const ActivityItem = memo(Item);
