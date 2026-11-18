import type { ReactNode } from 'react';

import { styled } from 'leather-styles/jsx';

import type { MultisigTransactionSummary } from '@leather.io/models';
import { Button, FailedIcon, ListItemBox, PendingIndicatorIcon, SentIcon } from '@leather.io/ui';

import { chainFromNetwork } from '../multisig.utils';
import { formatRelativeTime } from '../tx/relative-time';
import { ChainAvatar } from './chain-avatar';
import { transactionStatusIndicator, transactionStatusLabel } from './transaction-status';

export type TransactionRowScale = 'regular' | 'compact';

interface TransactionRowProps {
  transaction: MultisigTransactionSummary;
  subtitle?: string;
  // Signing threshold of the transaction's account, when known — lets a
  // collecting transaction read "2 of 3 signed" instead of a generic label.
  threshold?: number;
  // Settled value shown right-aligned on history rows: token amount over its
  // fiat equivalent. Only rendered on confirmed transactions, when provided.
  amount?: ReactNode;
  fiat?: ReactNode;
  // 'regular' for a main column, 'compact' for the narrower sidebar variant —
  // steps avatar, status icon, title type and leading down a notch.
  scale?: TransactionRowScale;
  needsAttention?: boolean;
  onClick?(): void;
}

function renderIndicator(status: MultisigTransactionSummary['status'], size: number) {
  const kind = transactionStatusIndicator(status);
  if (kind === 'pending') return <PendingIndicatorIcon size={size} />;
  if (kind === 'failed') return <FailedIcon width={size} height={size} />;
  return <SentIcon width={size} height={size} />;
}

export const scaleConfig = {
  regular: { avatarSize: 'lg', indicator: 16, title: 'label.02' },
  compact: { avatarSize: 'md', indicator: 12, title: 'label.02' },
} as const;

// A single transaction in a feed. Status never sits inline with the title (it
// crowded out long titles and won't survive a narrow sidebar): it reads as a
// plain sentence on the second line, in-flight state shows in the avatar
// sub-icon, and confirmed history stays quiet. The row is a ListItemBox, which
// carries the click target and the orange attention wash.
export function TransactionRow({
  transaction,
  subtitle,
  threshold,
  amount,
  fiat,
  scale = 'regular',
  needsAttention,
  onClick,
}: TransactionRowProps) {
  const cfg = scaleConfig[scale];
  const chain = chainFromNetwork(transaction.network);
  const asset = chain === 'btc' ? 'BTC' : 'STX';
  const indicator = renderIndicator(transaction.status, cfg.indicator);
  // Shown on every row except the action rows — those carry a Review CTA on the
  // right instead, so the value would have nowhere to sit without competing.
  const showValue = !needsAttention && amount != null;

  function renderCaption(): ReactNode {
    const { status } = transaction;
    if (status === 'failed' || status === 'dropped' || status === 'cancelled')
      return (
        <styled.span textStyle="caption.01" color="red.action-primary-default">
          {transactionStatusLabel(status)}
        </styled.span>
      );
    // Confirmed is quiet history — show context or when it happened, not "Confirmed".
    if (status === 'confirmed')
      return subtitle ?? formatRelativeTime(new Date(transaction.proposalTimestamp * 1000));
    // Still collecting and we know the threshold: show signature progress as a
    // plain sentence. Otherwise fall back to the status label.
    const label =
      (status === 'pending' || status === 'queued') && threshold !== undefined
        ? `${transaction.approvalCount} of ${threshold} signed`
        : transactionStatusLabel(status);
    return subtitle ? `${subtitle} · ${label}` : label;
  }

  return (
    <ListItemBox
      density={scale === 'compact' ? 'compact' : 'default'}
      highlight={needsAttention ? 'attention' : undefined}
      onClick={onClick}
      leading={<ChainAvatar chain={chain} size={cfg.avatarSize} indicator={indicator} />}
      title={
        <styled.span
          textStyle={cfg.title}
          display="block"
          minWidth={0}
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
        >
          Send {asset}
        </styled.span>
      }
      caption={renderCaption()}
      trailing={
        showValue ? (
          <styled.span textStyle={cfg.title} whiteSpace="nowrap">
            {amount}
          </styled.span>
        ) : undefined
      }
      trailingCaption={
        showValue && fiat != null ? (
          <styled.span textStyle="caption.01" color="ink.text-subdued" whiteSpace="nowrap">
            {fiat}
          </styled.span>
        ) : undefined
      }
      action={
        needsAttention ? (
          <Button size="sm" onClick={onClick}>
            Review
          </Button>
        ) : undefined
      }
    />
  );
}
