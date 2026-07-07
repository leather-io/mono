import { Box } from 'leather-styles/jsx';
import type { VaultActivityItem } from '~/features/multisig/activity/harmonize-vault-activity';

import { ListContainer } from '@leather.io/ui';

import { type TransactionRowScale } from './transaction-row';
import { transactionNeedsSignatures } from './transaction-status';
import { VaultActivityRow } from './vault-activity-row';

const previewLimit = 10;

interface VaultActivityListProps {
  items: VaultActivityItem[];
  scale?: TransactionRowScale;
  onSelect(vaultId: string, txId: string): void;
}

export function VaultActivityList({ items, scale, onSelect }: VaultActivityListProps) {
  return (
    <ListContainer>
      <Box display="flex" flexDirection="column" gap="space.01">
        {items.slice(0, previewLimit).map(item => {
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
