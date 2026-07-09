import { useNavigate } from 'react-router';

import { Box } from 'leather-styles/jsx';
import type { VaultActivityItem } from '~/features/multisig/activity/harmonize-vault-activity';

import { ListContainer } from '@leather.io/ui';

import { multisigPaths } from '../multisig.constants';
import { type TransactionRowScale } from './transaction-row';
import { VaultActivityRow } from './vault-activity-row';

interface VaultActivityListProps {
  items: VaultActivityItem[];
  scale?: TransactionRowScale;
  limit?: number;
  onSelect(vaultId: string, txId: string): void;
}

// Proposal rows open the multisig transaction; proposal-less rows open the on-chain detail.
function resolveRowClick(
  item: VaultActivityItem,
  onSelect: (vaultId: string, txId: string) => void,
  navigate: ReturnType<typeof useNavigate>
): (() => void) | undefined {
  const { multisig, vaultId, vaultAccountId, view } = item;
  if (multisig) return () => onSelect(multisig.vaultId, multisig.transaction.id);
  if (vaultId === undefined || vaultAccountId === undefined) return undefined;
  return () => void navigate(multisigPaths.activityDetail(vaultId, vaultAccountId, view.txid));
}

export function VaultActivityList({ items, scale, limit, onSelect }: VaultActivityListProps) {
  const navigate = useNavigate();
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
          const needsAttention = Boolean(item.multisig) && item.view.status === 'pending';
          return (
            <VaultActivityRow
              key={item.view.key}
              item={item}
              scale={scale}
              needsAttention={needsAttention}
              onClick={resolveRowClick(item, onSelect, navigate)}
            />
          );
        })}
      </Box>
    </ListContainer>
  );
}
