import { Box } from 'leather-styles/jsx';
import type { VaultActivityItem } from '~/features/multisig/activity/harmonize-vault-activity';

import { ListContainer } from '@leather.io/ui';

import { type TransactionRowScale } from './transaction-row';
import { transactionNeedsSignatures } from './transaction-status';
import { VaultActivityRow } from './vault-activity-row';

interface VaultActivityListProps {
  items: VaultActivityItem[];
  scale?: TransactionRowScale;
  limit?: number;
  onSelect(vaultId: string, txId: string): void;
}

export function VaultActivityList({ items, scale, limit, onSelect }: VaultActivityListProps) {
  const visibleItems = limit === undefined ? items : items.slice(0, limit);
  return (
    <ListContainer p="space.00" overflow="hidden">
      <Box
        display="flex"
        flexDirection="column"
        css={{
          '& > * + *': {
            borderTopWidth: '1px',
            borderTopStyle: 'solid',
            borderColor: 'ink.border-default',
          },
        }}
      >
        {visibleItems.map(item => {
          const multisig = item.multisig;
          const needsAttention = multisig
            ? transactionNeedsSignatures(
                multisig.transaction.status,
                multisig.transaction.approvalCount,
                multisig.threshold
              )
            : false;
          return (
            <VaultActivityRow
              key={item.view.key}
              item={item}
              scale={scale}
              needsAttention={needsAttention}
              onClick={
                multisig ? () => onSelect(multisig.vaultId, multisig.transaction.id) : undefined
              }
            />
          );
        })}
      </Box>
    </ListContainer>
  );
}
