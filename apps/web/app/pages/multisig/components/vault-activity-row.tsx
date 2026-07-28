import { styled } from 'leather-styles/jsx';
import type { VaultActivityItem } from '~/features/multisig/activity/harmonize-vault-activity';
import { formatCryptoGlanceable, formatCurrency } from '~/utils/currency-formatter';

import {
  type BlockchainActivityDirection,
  type BlockchainActivityIndicator,
  addOperator,
} from '@leather.io/features';
import {
  BlockchainActivityAvatarIcon,
  BlockchainActivityIndicatorIcon,
  Button,
  ListItemBox,
} from '@leather.io/ui';

import { formatRelativeTime } from '../tx/relative-time';
import { type TransactionRowScale, scaleConfig } from './transaction-row';

export interface ActivityRowLocation {
  vault?: string;
  account?: string;
  // Second-line fallback when there's no live signature progress, e.g. "2 of 3".
  threshold?: string;
}

interface VaultActivityRowProps {
  item: VaultActivityItem;
  scale?: TransactionRowScale;
  needsAttention?: boolean;
  location?: ActivityRowLocation;
  href?: string;
  onClick?(): void;
}

// Only while a proposal is in flight; settled transactions have no progress.
function signatureProgress(item: VaultActivityItem): string | undefined {
  const multisig = item.multisig;
  if (!multisig || multisig.threshold === undefined) return undefined;
  const { status, approvalCount } = multisig.transaction;
  if (
    status === 'confirmed' ||
    status === 'failed' ||
    status === 'dropped' ||
    status === 'cancelled'
  )
    return undefined;
  return `${approvalCount} of ${multisig.threshold}`;
}

function locationName({ vault, account }: ActivityRowLocation): string | undefined {
  return account ?? vault;
}

function resolveValueColor(
  indicator: BlockchainActivityIndicator,
  direction: BlockchainActivityDirection
) {
  if (indicator === 'pending' || indicator === 'failed') return 'ink.text-subdued';
  if (direction === 'received') return 'green.action-primary-default';
  return 'ink.text-primary';
}

// Plain string, not an element, so ItemLayout applies its caption styles. In
// the account context (no location) the tier label and Review button already
// convey signing state, so the caption falls back to a plain timestamp.
function captionText(item: VaultActivityItem, location?: ActivityRowLocation): string {
  const name = location ? locationName(location) : undefined;
  if (name) {
    const progress = signatureProgress(item) ?? location?.threshold;
    return progress ? `${name} · ${progress}` : name;
  }
  const timestamp = item.multisig?.transaction.proposalTimestamp ?? item.view.timestamp;
  return formatRelativeTime(new Date(timestamp * 1000));
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
  const valueColor = amount ? resolveValueColor(view.indicator, amount.direction) : undefined;

  return (
    <ListItemBox
      density={scale === 'compact' ? 'compact' : 'default'}
      highlight={needsAttention ? 'attention' : undefined}
      href={href}
      onClick={onClick}
      leading={
        <BlockchainActivityAvatarIcon
          avatar={view.avatar}
          indicator={<BlockchainActivityIndicatorIcon indicator={view.indicator} size={12} />}
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
          {view.subtitle || view.title || '—'}
        </styled.span>
      }
      caption={captionText(item, location)}
      trailing={
        !needsAttention && amount ? (
          <styled.span textStyle={cfg.title} whiteSpace="nowrap" color={valueColor}>
            {addOperator(
              formatCryptoGlanceable(amount.crypto ?? amount.quote),
              amount.direction === 'received' ? '+' : '−'
            )}
          </styled.span>
        ) : undefined
      }
      trailingCaption={
        !needsAttention && amount?.crypto ? (
          <styled.span textStyle="caption.01" color="ink.text-subdued" whiteSpace="nowrap">
            {formatCurrency(amount.quote)}
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
