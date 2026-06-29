import type { ReactNode } from 'react';

import { css } from 'leather-styles/css';
import { styled } from 'leather-styles/jsx';

import type { MultisigTransactionSummary } from '@leather.io/models';
import { FailedIcon, SentIcon } from '@leather.io/ui';

import { chainFromNetwork } from '../multisig.utils';
import { formatRelativeTime } from '../tx/relative-time';
import { ChainAvatar } from './chain-avatar';
import { transactionStatusIndicator, transactionStatusLabel } from './transaction-status';
import { VaultListItem } from './vault-list-item';

export type TransactionRowScale = 'regular' | 'compact';

interface TransactionRowProps {
  transaction: MultisigTransactionSummary;
  subtitle?: string;
  // Signing threshold of the transaction's account, when known — lets a
  // collecting transaction read "2 of 3 signed" instead of a generic label.
  threshold?: number;
  // 'regular' for a main column, 'compact' for the narrower sidebar variant —
  // steps avatar, status icon, title type and leading down a notch.
  scale?: TransactionRowScale;
}

const spinnerClass = css({ animation: 'spin', transformOrigin: 'center' });

// The shared PendingIcon asset is an invisible Figma conic-gradient export, so
// collecting transactions use a spinner badge matching the sent/failed sub-icons:
// a dark disc with a spinning ¾ ring.
function PendingIndicatorIcon({ size }: { size: number }) {
  return (
    <svg
      className={spinnerClass}
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="16" height="16" rx="8" fill="#12100F" />
      <path
        d="M8 3.5a4.5 4.5 0 1 1-4.5 4.5"
        stroke="#FFFFFF"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function renderIndicator(status: MultisigTransactionSummary['status'], size: number) {
  const kind = transactionStatusIndicator(status);
  if (kind === 'pending') return <PendingIndicatorIcon size={size} />;
  if (kind === 'failed') return <FailedIcon width={size} height={size} />;
  return <SentIcon width={size} height={size} />;
}

const scaleConfig = {
  regular: { avatarSize: 'lg', indicator: 16, title: 'label.02', tight: false },
  compact: { avatarSize: 'md', indicator: 16, title: 'label.03', tight: true },
} as const;

// A single transaction in a feed. Status never sits inline with the title (it
// crowded out long titles and won't survive a narrow sidebar): it reads as a
// plain sentence on the second line, in-flight state shows in the avatar
// sub-icon, and confirmed history stays quiet. Click handling lives on the
// wrapping button supplied by the list, so this stays presentational.
export function TransactionRow({
  transaction,
  subtitle,
  threshold,
  scale = 'regular',
}: TransactionRowProps) {
  const cfg = scaleConfig[scale];
  const chain = chainFromNetwork(transaction.network);
  const asset = chain === 'btc' ? 'BTC' : 'STX';
  const indicator = renderIndicator(transaction.status, cfg.indicator);

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
    <VaultListItem
      tightLeading={cfg.tight}
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
    />
  );
}
