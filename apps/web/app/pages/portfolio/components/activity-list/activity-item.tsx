import { memo } from 'react';

import { styled } from 'leather-styles/jsx';
import { Balance } from '~/components/balance/balance';
import { useUserSettings } from '~/hooks/use-user-settings';
import { formatCurrency } from '~/utils/currency-formatter';
import { openExternalLink } from '~/utils/external-links';

import { btcAsset, stxAsset } from '@leather.io/constants';
import {
  type BlockchainActivityDirection,
  type BlockchainActivityIndicator,
  type BlockchainActivityView,
  formatBlockchainActivityCaption,
  makeActivityLink,
} from '@leather.io/features';
import {
  BlockchainActivityAvatarIcon,
  BlockchainActivityIndicatorIcon,
  ListItemBox,
} from '@leather.io/ui';
import { minusSign } from '@leather.io/utils';

const indicatorSize = 12;

interface ActivityItemProps {
  item: BlockchainActivityView;
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
  const { network } = useUserSettings();
  const activityLink = makeActivityLink({
    txid: item.txid,
    networkPreference: network,
    asset: item.chain === 'bitcoin' ? btcAsset : stxAsset,
  });
  const { amount } = item;
  const valueColor = amount ? resolveValueColor(item.indicator, amount.direction) : undefined;

  return (
    <ListItemBox
      onClick={activityLink ? () => openExternalLink(activityLink) : undefined}
      leading={
        <BlockchainActivityAvatarIcon
          avatar={item.avatar}
          indicator={
            <BlockchainActivityIndicatorIcon indicator={item.indicator} size={indicatorSize} />
          }
        />
      }
      title={
        <styled.span
          textStyle="label.02"
          color={item.status === 'success' ? 'ink.text-primary' : 'ink.text-subdued'}
          display="block"
          minWidth={0}
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
        >
          {item.title || item.subtitle || '—'}
        </styled.span>
      }
      caption={formatBlockchainActivityCaption(item)}
      trailing={
        amount ? (
          <Balance
            balance={amount.crypto ?? amount.quote}
            operator={amount.direction === 'received' ? '+' : minusSign}
            formattingOptions={amount.crypto ? { showCurrency: false } : undefined}
            color={valueColor}
            textStyle="label.02"
            whiteSpace="nowrap"
            formatCurrency={formatCurrency}
          />
        ) : undefined
      }
      trailingCaption={
        amount?.crypto ? (
          <Balance
            balance={amount.quote}
            color="ink.text-subdued"
            textStyle="caption.01"
            whiteSpace="nowrap"
            formatCurrency={formatCurrency}
          />
        ) : undefined
      }
    />
  );
}

export const ActivityItem = memo(ActivityItemComponent);
