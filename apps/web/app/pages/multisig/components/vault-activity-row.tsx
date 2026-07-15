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

export interface ActivityRowLocation {
  vault?: string;
  account?: string;
}

interface VaultActivityRowProps {
  item: VaultActivityItem;
  scale?: TransactionRowScale;
  needsAttention?: boolean;
  location?: ActivityRowLocation;
  href?: string;
  onClick?(): void;
}

function renderLocation({ vault, account }: ActivityRowLocation): ReactNode {
  const truncating = {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    minWidth: 0,
  } as const;
  return (
    <styled.span display="flex" width="100%" minWidth={0} gap="space.01">
      {vault ? <styled.span {...truncating}>{vault}</styled.span> : null}
      {vault && account ? <styled.span flexShrink={0}>·</styled.span> : null}
      {account ? <styled.span {...truncating}>{account}</styled.span> : null}
    </styled.span>
  );
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

  const { status, approvalCount, signedByMe } = multisig.transaction;
  if (status === 'pending' && !signedByMe) {
    return <Badge label="Awaiting your signature" variant="pending" size="sm" />;
  }
  const display = transactionStatusBadge(status);
  const label =
    status === 'pending' && multisig.threshold !== undefined
      ? `${approvalCount} of ${multisig.threshold} signed`
      : display.label;
  return <Badge label={label} variant={display.variant} size="sm" />;
}

export function VaultActivityRow({
  item,
  scale = 'regular',
  needsAttention,
  location,
  href,
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
      href={href}
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
      caption={
        location ? (
          <styled.span
            display="block"
            alignSelf="stretch"
            minWidth={0}
            textStyle="caption.01"
            color="ink.text-subdued"
          >
            {renderLocation(location)}
            <styled.span display="block">{renderCaption(item)}</styled.span>
          </styled.span>
        ) : (
          renderCaption(item)
        )
      }
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
