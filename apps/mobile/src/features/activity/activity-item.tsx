import { memo } from 'react';

import { Balance } from '@/components/balance/balance';
import { t } from '@lingui/core/macro';
import type { ResponsiveValue } from '@shopify/restyle';

import { type ActivityView } from '@leather.io/features';
import { ActivityAvatarIcon, Cell, type Theme } from '@leather.io/ui/native';

import { useOpenUrl } from '../browser/browser/use-open-url';
import { translateActivityStatus } from './translate-activity-status';

interface ActivityItemProps {
  item: ActivityView;
}

function ActivityItemComponent({ item }: ActivityItemProps) {
  const { balances, statusLabel, title, caption, activityLink, activityAvatar, statusIndicator } =
    item;
  const { openUrl } = useOpenUrl();

  const titleText = translateActivityStatus(statusLabel);
  const timestampText = caption.startsWith(statusLabel)
    ? caption.slice(statusLabel.length).trim()
    : caption;

  function getSwapStatusText(status: string) {
    if (status === 'pending') {
      return t`Swapping`;
    } else if (status === 'failed') {
      return t`Swap failed`;
    } else {
      return t`Swapped`;
    }
  }
  const swapStatusText = getSwapStatusText(statusIndicator);

  const secondaryText =
    activityAvatar === 'swap' ? `${swapStatusText} ${timestampText}` : timestampText;

  return (
    <Cell.Root
      pressable={Boolean(activityLink)}
      onPress={activityLink ? () => openUrl(activityLink) : undefined}
    >
      <Cell.Icon>
        <ActivityAvatarIcon activity={item} />
      </Cell.Icon>
      <Cell.Content>
        <Cell.Label variant="primary" fontSize={15}>
          {titleText || title}
        </Cell.Label>
        <Cell.Label variant="secondary" fontSize={15}>
          {secondaryText}
        </Cell.Label>
      </Cell.Content>
      <Cell.Aside>
        {balances.quote ? (
          <Cell.Label variant="primary" color="ink.text-subdued" lineHeight={16} fontSize={13}>
            <Balance
              operator={balances.operator}
              balance={balances.quote}
              color={balances.color as ResponsiveValue<keyof Theme['colors'], Theme['breakpoints']>}
              fontSize={15}
            />
          </Cell.Label>
        ) : undefined}
        {balances.crypto ? (
          <Cell.Label variant="secondary" color="ink.text-subdued" lineHeight={16} fontSize={13}>
            <Balance
              formattingOptions={{ showCurrency: false }}
              balance={balances.crypto}
              variant="caption01"
              color="ink.text-subdued"
              lineHeight={16}
              fontSize={13}
            />
          </Cell.Label>
        ) : undefined}
      </Cell.Aside>
    </Cell.Root>
  );
}

export const ActivityItem = memo(ActivityItemComponent);
