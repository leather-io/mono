import { useNavigate } from 'react-router';

import { Box, styled } from 'leather-styles/jsx';
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
function resolveRowLink(
  item: VaultActivityItem,
  onSelect: (vaultId: string, txId: string) => void,
  navigate: ReturnType<typeof useNavigate>
): { href: string; onClick(): void } | undefined {
  const { multisig, vaultId, vaultAccountId, view } = item;
  if (multisig) {
    return {
      href: multisigPaths.tx(multisig.vaultId, multisig.transaction.id),
      onClick: () => onSelect(multisig.vaultId, multisig.transaction.id),
    };
  }
  if (vaultId === undefined || vaultAccountId === undefined) return undefined;
  const href = multisigPaths.activityDetail(vaultId, vaultAccountId, view.txid);
  return { href, onClick: () => void navigate(href) };
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
          const link = resolveRowLink(item, onSelect, navigate);
          return (
            <VaultActivityRow
              key={item.view.key}
              item={item}
              scale={scale}
              needsAttention={needsAttention}
              href={link?.href}
              onClick={link?.onClick}
            />
          );
        })}
      </Box>
      {limit !== undefined && items.length > limit ? (
        <styled.p
          textStyle="caption.01"
          color="ink.text-subdued"
          textAlign="center"
          px="space.04"
          py="space.03"
          borderTopWidth="1px"
          borderTopStyle="solid"
          borderColor="ink.border-default"
        >
          Open an account to view its full history
        </styled.p>
      ) : null}
    </ListContainer>
  );
}
