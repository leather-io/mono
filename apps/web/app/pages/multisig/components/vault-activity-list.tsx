import { useNavigate } from 'react-router';

import { Box, styled } from 'leather-styles/jsx';
import type { VaultActivityItem } from '~/features/multisig/activity/harmonize-vault-activity';

import { ListContainer } from '@leather.io/ui';

import { multisigPaths } from '../multisig.constants';
import { type TransactionRowScale } from './transaction-row';
import { type ActivityRowLocation, VaultActivityRow } from './vault-activity-row';

interface VaultActivityListProps {
  items: VaultActivityItem[];
  scale?: TransactionRowScale;
  limit?: number;
  vaultNamesById?: ReadonlyMap<string, string>;
  accountNamesById?: ReadonlyMap<string, string>;
  onSelect(vaultId: string, txId: string): void;
}

function resolveLocation(
  item: VaultActivityItem,
  vaultNamesById?: ReadonlyMap<string, string>,
  accountNamesById?: ReadonlyMap<string, string>
): ActivityRowLocation | undefined {
  const vault =
    vaultNamesById && item.vaultId
      ? (vaultNamesById.get(item.vaultId) ?? item.multisig?.vaultName)
      : undefined;
  const account =
    accountNamesById && item.vaultAccountId ? accountNamesById.get(item.vaultAccountId) : undefined;
  if (!vault && !account) return undefined;
  return { vault, account };
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

export function VaultActivityList({
  items,
  scale,
  limit,
  vaultNamesById,
  accountNamesById,
  onSelect,
}: VaultActivityListProps) {
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
          const needsAttention = Boolean(
            item.multisig && item.view.status === 'pending' && !item.multisig.transaction.signedByMe
          );
          const link = resolveRowLink(item, onSelect, navigate);
          const location = resolveLocation(item, vaultNamesById, accountNamesById);
          return (
            <VaultActivityRow
              key={`${item.view.key}:${item.vaultAccountId ?? ''}`}
              item={item}
              scale={scale}
              needsAttention={needsAttention}
              location={location}
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
