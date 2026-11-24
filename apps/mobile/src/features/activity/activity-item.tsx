import { memo } from 'react';

import { Balance } from '@/components/balance/balance';
import { useSettings } from '@/store/settings/settings';

import { btcAsset, stxAsset } from '@leather.io/constants';
import {
  type BlockchainActivityDirection,
  type BlockchainActivityIndicator,
  type BlockchainActivityItem,
  formatBlockchainActivityCaption,
  makeActivityLink,
} from '@leather.io/features';
import {
  BlockchainActivityAvatarIcon,
  BlockchainActivityIndicatorIcon,
  Cell,
} from '@leather.io/ui/native';
import { minusSign } from '@leather.io/utils';

import { useOpenUrl } from '../browser/browser/use-open-url';

const indicatorSize = 16;

interface ActivityItemProps {
  item: BlockchainActivityItem;
}

function resolveValueColor(
  indicator: BlockchainActivityIndicator,
  direction: BlockchainActivityDirection
) {
  if (indicator === 'pending' || indicator === 'failed' || indicator === 'cancelled')
    return 'ink.text-subdued';
  if (direction === 'received') return 'green.action-primary-default';
  return 'ink.text-primary';
}

function ActivityItemComponent({ item }: ActivityItemProps) {
  const { view } = item;
  const { networkPreference } = useSettings();
  const { openUrl } = useOpenUrl();

  const activityLink = makeActivityLink({
    txid: view.txid,
    networkPreference,
    asset: view.chain === 'bitcoin' ? btcAsset : stxAsset,
  });
  const { amount } = view;
  const valueColor = amount ? resolveValueColor(view.indicator, amount.direction) : undefined;

  return (
    <Cell.Root
      pressable={Boolean(activityLink)}
      onPress={activityLink ? () => openUrl(activityLink) : undefined}
    >
      <Cell.Icon>
        <BlockchainActivityAvatarIcon
          avatar={view.avatar}
          indicator={
            <BlockchainActivityIndicatorIcon indicator={view.indicator} size={indicatorSize} />
          }
        />
      </Cell.Icon>
      <Cell.Content>
        <Cell.Label
          variant="primary"
          fontSize={15}
          color={view.status === 'success' ? 'ink.text-primary' : 'ink.text-subdued'}
        >
          {view.title || view.subtitle || '—'}
        </Cell.Label>
        <Cell.Label variant="secondary" fontSize={15}>
          {formatBlockchainActivityCaption(view)}
        </Cell.Label>
      </Cell.Content>
      {amount ? (
        <Cell.Aside>
          <Cell.Label variant="primary" lineHeight={16} fontSize={13}>
            <Balance
              balance={amount.crypto ?? amount.quote}
              operator={amount.direction === 'received' ? '+' : minusSign}
              formattingOptions={amount.crypto ? { showCurrency: false } : undefined}
              color={valueColor}
              fontSize={15}
            />
          </Cell.Label>
          {amount.crypto ? (
            <Cell.Label variant="secondary" color="ink.text-subdued" lineHeight={16} fontSize={13}>
              <Balance
                balance={amount.quote}
                variant="caption01"
                color="ink.text-subdued"
                lineHeight={16}
                fontSize={13}
              />
            </Cell.Label>
          ) : undefined}
        </Cell.Aside>
      ) : undefined}
    </Cell.Root>
  );
}

export const ActivityItem = memo(ActivityItemComponent);
