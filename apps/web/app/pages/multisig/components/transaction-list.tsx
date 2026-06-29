import { Box, styled } from 'leather-styles/jsx';

import type { MultisigTransactionSummary } from '@leather.io/models';

import { TransactionRow, type TransactionRowScale } from './transaction-row';
import { isTransactionProcessed, transactionNeedsSignatures } from './transaction-status';

// How many processed transactions the history group shows before a dedicated
// full-history view would be needed.
const historyLimit = 5;

// The same orange "needs attention" wash used on invited vault cards, reused
// here for transactions still waiting on signatures since the row is itself the
// click target and can't carry an inline action button.
const actionGradient =
  'linear-gradient(90deg, rgb(from token(colors.orange.action-primary-default) r g b / 0.16), rgb(from token(colors.orange.action-primary-default) r g b / 0) 70%)';
const actionGradientHover =
  'linear-gradient(90deg, rgb(from token(colors.orange.action-primary-default) r g b / 0.28), rgb(from token(colors.orange.action-primary-default) r g b / 0) 80%)';

export interface TransactionListItem {
  transaction: MultisigTransactionSummary;
  vaultId: string;
  subtitle?: string;
  threshold?: number;
}

interface TransactionListProps {
  items: TransactionListItem[];
  scale?: TransactionRowScale;
  onSelect(vaultId: string, txId: string): void;
}

function GroupLabel({ children }: { children: string }) {
  return (
    <styled.h4
      textStyle="label.03"
      color="ink.text-subdued"
      px="space.03"
      pt="space.02"
      pb="space.01"
    >
      {children}
    </styled.h4>
  );
}

function byNewest(a: TransactionListItem, b: TransactionListItem) {
  return b.transaction.proposalTimestamp - a.transaction.proposalTimestamp;
}

// Sorts a feed into three tiers inside one container: transactions waiting on
// signatures (highlighted, since they want action), other in-flight work, then
// the processed history beneath — each newest first by real proposal timestamp.
export function TransactionList({ items, scale, onSelect }: TransactionListProps) {
  const needsSignatures: TransactionListItem[] = [];
  const inProgress: TransactionListItem[] = [];
  const history: TransactionListItem[] = [];
  for (const item of items) {
    const { status, approvalCount } = item.transaction;
    if (isTransactionProcessed(status)) history.push(item);
    else if (transactionNeedsSignatures(status, approvalCount, item.threshold))
      needsSignatures.push(item);
    else inProgress.push(item);
  }
  needsSignatures.sort(byNewest);
  inProgress.sort(byNewest);
  history.sort(byNewest);

  function renderRow(item: TransactionListItem, needsAction: boolean) {
    return (
      <styled.button
        key={item.transaction.id}
        type="button"
        onClick={() => onSelect(item.vaultId, item.transaction.id)}
        display="block"
        width="100%"
        textAlign="left"
        cursor="pointer"
        border="none"
        bg="transparent"
        borderRadius="sm"
        px="space.03"
        py={scale === 'compact' ? 'space.02' : 'space.03'}
        bgImage={needsAction ? actionGradient : undefined}
        _hover={
          needsAction ? { bgImage: actionGradientHover } : { bg: 'ink.component-background-hover' }
        }
      >
        <TransactionRow
          transaction={item.transaction}
          subtitle={item.subtitle}
          threshold={item.threshold}
          scale={scale}
        />
      </styled.button>
    );
  }

  function renderGroup(label: string, group: TransactionListItem[], needsAction = false) {
    if (group.length === 0) return null;
    return (
      <Box>
        <GroupLabel>{label}</GroupLabel>
        <Box display="flex" flexDirection="column" gap="space.01">
          {group.map(item => renderRow(item, needsAction))}
        </Box>
      </Box>
    );
  }

  return (
    <Box
      borderWidth="1px"
      borderStyle="solid"
      borderColor="ink.border-default"
      borderRadius="md"
      bg="ink.background-primary"
      p="space.02"
    >
      {renderGroup('Needs signatures', needsSignatures, true)}
      {renderGroup('In progress', inProgress)}
      {renderGroup('History', history.slice(0, historyLimit))}
    </Box>
  );
}
