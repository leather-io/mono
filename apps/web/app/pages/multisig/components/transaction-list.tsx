import type { ReactNode } from 'react';

import { Box, styled } from 'leather-styles/jsx';

import type { MultisigTransactionSummary } from '@leather.io/models';
import { ListContainer } from '@leather.io/ui';

import { TransactionRow, type TransactionRowScale } from './transaction-row';
import { isTransactionProcessed, transactionNeedsSignatures } from './transaction-status';

// How many processed transactions the history group shows before a dedicated
// full-history view would be needed.
const historyLimit = 5;

export interface TransactionListItem {
  transaction: MultisigTransactionSummary;
  vaultId: string;
  subtitle?: string;
  threshold?: number;
  // Settled transaction value, right-aligned on history rows: token amount over
  // its fiat equivalent. Optional because the feed summary carries no amount —
  // it is populated only where the value has been resolved (decoded / on-chain).
  amount?: ReactNode;
  fiat?: ReactNode;
}

interface TransactionListProps {
  items: TransactionListItem[];
  scale?: TransactionRowScale;
  onSelect(vaultId: string, txId: string): void;
}

export function GroupLabel({ children }: { children: string }) {
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

  function renderRow(item: TransactionListItem, needsAttention: boolean) {
    return (
      <TransactionRow
        key={item.transaction.id}
        transaction={item.transaction}
        subtitle={item.subtitle}
        threshold={item.threshold}
        amount={item.amount}
        fiat={item.fiat}
        scale={scale}
        needsAttention={needsAttention}
        onClick={() => onSelect(item.vaultId, item.transaction.id)}
      />
    );
  }

  function renderGroup(label: string, group: TransactionListItem[], needsAttention = false) {
    if (group.length === 0) return null;
    return (
      <Box>
        <GroupLabel>{label}</GroupLabel>
        <Box display="flex" flexDirection="column" gap="space.01">
          {group.map(item => renderRow(item, needsAttention))}
        </Box>
      </Box>
    );
  }

  return (
    <ListContainer>
      {renderGroup('Needs signatures', needsSignatures, true)}
      {renderGroup('In progress', inProgress)}
      {renderGroup('History', history.slice(0, historyLimit))}
    </ListContainer>
  );
}
