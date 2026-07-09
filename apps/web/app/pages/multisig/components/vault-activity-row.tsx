import type { ReactNode } from 'react';

import { styled } from 'leather-styles/jsx';
import type { VaultActivityItem } from '~/features/multisig/activity/harmonize-vault-activity';
import { mapMultisigTransactionStatus } from '~/features/multisig/activity/multisig-transaction-activity-view';
import { formatCurrency } from '~/utils/currency-formatter';

import {
  type BlockchainActivityDirection,
  type BlockchainActivityIndicator,
  addOperator,
} from '@leather.io/features';
import {
  BlockchainActivityAvatarIcon,
  FailedIcon,
  FunctionActivityIcon,
  ListItemBox,
  ReceivedIcon,
  SentIcon,
  SwapIcon,
} from '@leather.io/ui';
import { assertUnreachable } from '@leather.io/utils';

import { formatRelativeTime } from '../tx/relative-time';
import { Badge } from './badge';
import { PendingIndicatorIcon, type TransactionRowScale, scaleConfig } from './transaction-row';
import { transactionStatusBadge } from './transaction-status';

interface VaultActivityRowProps {
  item: VaultActivityItem;
  scale?: TransactionRowScale;
  needsAttention?: boolean;
  onClick?(): void;
}

function resolveQuoteColor(
  indicator: BlockchainActivityIndicator,
  direction: BlockchainActivityDirection
) {
  if (indicator === 'pending' || indicator === 'failed') return 'ink.text-subdued';
  if (direction === 'received') return 'green.action-primary-default';
  return 'ink.text-primary';
}

function renderIndicator(indicator: BlockchainActivityIndicator, size: number) {
  switch (indicator) {
    case 'pending':
      return <PendingIndicatorIcon size={size} />;
    case 'failed':
      return <FailedIcon width={size} height={size} />;
    case 'received':
      return <ReceivedIcon width={size} height={size} />;
    case 'swap':
      return <SwapIcon width={size} height={size} />;
    case 'function':
      return <FunctionActivityIcon width={size} height={size} />;
    case 'sent':
      return <SentIcon width={size} height={size} />;
    default:
      return assertUnreachable(indicator);
  }
}

function renderCaption(item: VaultActivityItem): ReactNode {
  const { view, multisig } = item;
  if (view.subtitle) return view.subtitle;
  const timestamp = multisig?.transaction.proposalTimestamp ?? view.timestamp;
  return formatRelativeTime(new Date(timestamp * 1000));
}

function renderStatusChip(item: VaultActivityItem): ReactNode {
  const multisig = item.multisig;
  if (!multisig || multisig.transaction.status === 'confirmed') return undefined;
  const backendInFlight = mapMultisigTransactionStatus(multisig.transaction.status) === 'pending';
  if (backendInFlight && item.view.status !== 'pending') return undefined;

  const { status, approvalCount } = multisig.transaction;
  const display = transactionStatusBadge(status);
  const label =
    (status === 'pending' || status === 'queued') && multisig.threshold !== undefined
      ? `${approvalCount} of ${multisig.threshold} signed`
      : display.label;
  return <Badge label={label} variant={display.variant} size="sm" />;
}

export function VaultActivityRow({
  item,
  scale = 'regular',
  needsAttention,
  onClick,
}: VaultActivityRowProps) {
  const { view } = item;
  const cfg = scaleConfig[scale];
  const amount = view.amount;

  return (
    <ListItemBox
      density={scale === 'compact' ? 'compact' : 'default'}
      flush
      highlight={needsAttention ? 'attention' : undefined}
      onClick={onClick}
      leading={
        <BlockchainActivityAvatarIcon
          avatar={view.avatar}
          indicator={renderIndicator(view.indicator, 12)}
        />
      }
      title={
        <styled.span
          textStyle={cfg.title}
          color={view.status === 'success' ? 'ink.text-primary' : 'ink.text-subdued'}
          display="block"
          minWidth={0}
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
        >
          {view.title || '—'}
        </styled.span>
      }
      titleAccessory={renderStatusChip(item)}
      caption={renderCaption(item)}
      trailing={
        amount ? (
          <styled.span
            textStyle={cfg.title}
            whiteSpace="nowrap"
            color={resolveQuoteColor(view.indicator, amount.direction)}
          >
            {addOperator(formatCurrency(amount.quote), amount.direction === 'received' ? '+' : '−')}
          </styled.span>
        ) : undefined
      }
      trailingCaption={
        amount?.crypto ? (
          <styled.span textStyle="caption.01" color="ink.text-subdued" whiteSpace="nowrap">
            {formatCurrency(amount.crypto)}
          </styled.span>
        ) : undefined
      }
    />
  );
}
