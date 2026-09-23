import { HStack, styled } from 'leather-styles/jsx';

import type { BlockchainActivityBalanceChange } from '@leather.io/models';
import {
  BitcoinFilledCircleIcon,
  BlockchainActivityAvatarIcon,
  ListItemBox,
  StacksFilledCircleIcon,
} from '@leather.io/ui';

import { formatCurrency } from '@app/common/currency-formatter';
import { Balance } from '@app/components/balance/balance';
import { CopyValue } from '@app/components/value-actions';

import {
  type ActivityCounterparty,
  type ActivityStatusTone,
  resolveAssetChainLabel,
  resolveAssetTitle,
} from '../activity-details-summary';

export const outcomeAvatarSize = 36;

interface ChainIndicatorProps {
  chain: BlockchainActivityBalanceChange['asset']['chain'];
}

function ChainIndicator({ chain }: ChainIndicatorProps) {
  if (chain === 'bitcoin') return <BitcoinFilledCircleIcon variant="small" />;
  return <StacksFilledCircleIcon variant="small" />;
}

function resolveOperator(direction: BlockchainActivityBalanceChange['direction']) {
  return direction === 'received' ? '+' : '−';
}

function resolveAmountColor(
  direction: BlockchainActivityBalanceChange['direction'],
  tone: ActivityStatusTone
) {
  if (tone === 'warning' || tone === 'error') return 'ink.text-subdued';
  if (direction === 'received') return 'green.action-primary-default';
  return 'ink.text-primary';
}

interface ActivityCounterpartyCaptionProps {
  direction: BlockchainActivityBalanceChange['direction'];
  counterparty: ActivityCounterparty;
}

function ActivityCounterpartyCaption({
  direction,
  counterparty,
}: ActivityCounterpartyCaptionProps) {
  const preposition = direction === 'received' ? 'From' : 'To';

  return (
    <HStack gap="space.01" alignItems="center" minWidth={0}>
      <styled.span textStyle="caption.01" color="ink.text-subdued">
        {preposition}
      </styled.span>
      {counterparty.address ? (
        <CopyValue value={counterparty.address} display={counterparty.label} />
      ) : (
        <styled.span textStyle="caption.01" color="ink.text-subdued">
          {counterparty.label}
        </styled.span>
      )}
    </HStack>
  );
}

interface ActivityOutcomeRowProps {
  change: BlockchainActivityBalanceChange;
  tone: ActivityStatusTone;
  counterparty?: ActivityCounterparty;
}

export function ActivityOutcomeRow({ change, tone, counterparty }: ActivityOutcomeRowProps) {
  return (
    <ListItemBox
      variant="plain"
      density="compact"
      leading={
        <BlockchainActivityAvatarIcon
          avatar={{ kind: 'single', asset: change.asset }}
          size={outcomeAvatarSize}
          indicator={<ChainIndicator chain={change.asset.chain} />}
        />
      }
      title={<styled.span textStyle="label.01">{resolveAssetTitle(change.asset)}</styled.span>}
      caption={
        counterparty ? (
          <ActivityCounterpartyCaption direction={change.direction} counterparty={counterparty} />
        ) : (
          <styled.span textStyle="caption.01" color="ink.text-subdued">
            {resolveAssetChainLabel(change.asset)}
          </styled.span>
        )
      }
      trailing={
        <Balance
          balance={change.amount.crypto}
          operator={resolveOperator(change.direction)}
          color={resolveAmountColor(change.direction, tone)}
          textStyle="label.01"
          whiteSpace="nowrap"
          formatCurrency={formatCurrency}
        />
      }
      trailingCaption={
        <Balance
          balance={change.amount.quote}
          color="ink.text-subdued"
          textStyle="caption.01"
          whiteSpace="nowrap"
          formatCurrency={formatCurrency}
        />
      }
    />
  );
}
