import { memo } from 'react';

import { styled } from 'leather-styles/jsx';

import {
  type BlockchainActivityDirection,
  type BlockchainActivityIndicator,
  type BlockchainActivityItem,
  formatActivityCaption,
} from '@leather.io/features';
import {
  BlockchainActivityAvatarIcon,
  BlockchainActivityIndicatorIcon,
  Link,
  ListItemBox,
} from '@leather.io/ui';

import { analytics } from '@shared/utils/analytics';

import { formatCurrency } from '@app/common/currency-formatter';
import { useBitcoinExplorerLink } from '@app/common/hooks/use-bitcoin-explorer-link';
import { useStacksExplorerLink } from '@app/common/hooks/use-stacks-explorer-link';
import { openInNewTab } from '@app/common/utils/open-in-new-tab';
import { Balance } from '@app/components/balance/balance';

import type { SbtcDepositOverlay } from '../use-sbtc-deposit-activity';
import { ActivityRowActions, getActivityActionKind } from './activity-row-actions';

const indicatorSize = 12;

interface ActivityRowProps {
  item: BlockchainActivityItem;
  sbtcOverlay?: SbtcDepositOverlay;
}

function resolveValueColor(
  indicator: BlockchainActivityIndicator,
  direction: BlockchainActivityDirection
) {
  if (indicator === 'pending' || indicator === 'failed') return 'ink.text-subdued';
  if (direction === 'received') return 'green.action-primary-default';
  return 'ink.text-primary';
}

function Row({ item, sbtcOverlay }: ActivityRowProps) {
  const { activity, view } = item;
  const { handleOpenBitcoinTxLink } = useBitcoinExplorerLink();
  const { handleOpenStacksTxLink } = useStacksExplorerLink();

  const { amount } = view;
  const valueColor = amount ? resolveValueColor(view.indicator, amount.direction) : undefined;
  const actionKind = getActivityActionKind(activity);

  function openInExplorer() {
    if (view.chain === 'bitcoin') {
      analytics.track('view_bitcoin_transaction');
      handleOpenBitcoinTxLink({ txid: view.txid });
      return;
    }
    analytics.track('view_transaction');
    handleOpenStacksTxLink({ txid: view.txid });
  }

  function renderAction() {
    const reclaimUrl = sbtcOverlay?.reclaimUrl;
    if (reclaimUrl) return <Link onClick={() => openInNewTab(reclaimUrl)}>Reclaim</Link>;
    if (actionKind) return <ActivityRowActions kind={actionKind} txid={view.txid} />;
    return undefined;
  }

  return (
    <ListItemBox
      onClick={sbtcOverlay?.reclaimUrl ? undefined : openInExplorer}
      leading={
        <BlockchainActivityAvatarIcon
          avatar={view.avatar}
          indicator={
            <BlockchainActivityIndicatorIcon indicator={view.indicator} size={indicatorSize} />
          }
        />
      }
      title={
        <styled.span
          textStyle="label.02"
          color={view.status === 'success' ? 'ink.text-primary' : 'ink.text-subdued'}
          display="block"
          minWidth={0}
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
        >
          {sbtcOverlay?.title || view.title || view.subtitle || '—'}
        </styled.span>
      }
      caption={
        sbtcOverlay ? (
          <styled.span textStyle="caption.01" color={sbtcOverlay.statusColor}>
            {sbtcOverlay.statusLabel}
          </styled.span>
        ) : (
          view.subtitle || formatActivityCaption({ timestamp: view.timestamp })
        )
      }
      trailing={
        amount ? (
          <Balance
            balance={amount.crypto ?? amount.quote}
            operator={amount.direction === 'received' ? '+' : '−'}
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
      action={renderAction()}
    />
  );
}

export const ActivityRow = memo(Row);
