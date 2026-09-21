import { styled } from 'leather-styles/jsx';

import type { BlockchainActivityBalanceChange } from '@leather.io/models';
import { BlockchainActivityAvatarIcon, ListItemBox } from '@leather.io/ui';

import { formatCurrency } from '@app/common/currency-formatter';
import { useClipboard } from '@app/common/hooks/use-copy-to-clipboard';
import { Balance } from '@app/components/balance/balance';

import { type ActivityStatusTone, resolveAssetTitle } from '../activity-details-summary';

export const outcomeAvatarSize = 36;

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
  counterparty: string;
}

function ActivityCounterpartyCaption({
  direction,
  counterparty,
}: ActivityCounterpartyCaptionProps) {
  const { onCopy } = useClipboard(counterparty);
  return (
    <styled.button
      type="button"
      onClick={onCopy}
      title="Copy address"
      textStyle="caption.01"
      color="ink.text-subdued"
      textDecoration="underline"
      cursor="pointer"
      textAlign="left"
      width="fit-content"
      _hover={{ color: 'ink.text-primary' }}
    >
      {`${direction === 'received' ? 'From' : 'To'}: ${counterparty}`}
    </styled.button>
  );
}

interface ActivityOutcomeRowProps {
  change: BlockchainActivityBalanceChange;
  tone: ActivityStatusTone;
  counterparty?: string;
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
        />
      }
      title={<styled.span textStyle="label.01">{resolveAssetTitle(change.asset)}</styled.span>}
      caption={
        counterparty ? (
          <ActivityCounterpartyCaption direction={change.direction} counterparty={counterparty} />
        ) : undefined
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
