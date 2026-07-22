import { useNavigate } from 'react-router';

import { Box, styled } from 'leather-styles/jsx';
import type { VaultActivityItem } from '~/features/multisig/activity/harmonize-vault-activity';

import { ListContainer } from '@leather.io/ui';

import { multisigPaths } from '../multisig.constants';
import { GroupLabel } from './transaction-list';
import { type TransactionRowScale } from './transaction-row';
import { type ActivityRowLocation, VaultActivityRow } from './vault-activity-row';

interface VaultActivityListProps {
  items: VaultActivityItem[];
  scale?: TransactionRowScale;
  limit?: number;
  vaultNamesById?: ReadonlyMap<string, string>;
  accountNamesById?: ReadonlyMap<string, string>;
  accountThresholdsById?: ReadonlyMap<string, string>;
  onSelect(vaultId: string, txId: string): void;
}

function resolveLocation(
  item: VaultActivityItem,
  vaultNamesById?: ReadonlyMap<string, string>,
  accountNamesById?: ReadonlyMap<string, string>,
  accountThresholdsById?: ReadonlyMap<string, string>
): ActivityRowLocation | undefined {
  const vault =
    vaultNamesById && item.vaultId
      ? (vaultNamesById.get(item.vaultId) ?? item.multisig?.vaultName)
      : undefined;
  const account =
    accountNamesById && item.vaultAccountId ? accountNamesById.get(item.vaultAccountId) : undefined;
  if (!vault && !account) return undefined;
  const threshold =
    accountThresholdsById && item.vaultAccountId
      ? accountThresholdsById.get(item.vaultAccountId)
      : undefined;
  return { vault, account, threshold };
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

function needsAttention(item: VaultActivityItem) {
  return Boolean(
    item.multisig && item.view.status === 'pending' && !item.multisig.transaction.signedByMe
  );
}

function tierOf(item: VaultActivityItem): 'action' | 'inFlight' | 'history' {
  if (needsAttention(item)) return 'action';
  if (item.view.status === 'pending') return 'inFlight';
  return 'history';
}

// One flat container, no divider lines between rows: the feed is grouped into
// three tiers instead — transactions waiting on signatures (highlighted, they
// want action), other in-flight work, then processed history.
export function VaultActivityList({
  items,
  scale,
  limit,
  vaultNamesById,
  accountNamesById,
  accountThresholdsById,
  onSelect,
}: VaultActivityListProps) {
  const navigate = useNavigate();
  const visibleItems = limit === undefined ? items : items.slice(0, limit);

  function renderRow(item: VaultActivityItem) {
    const link = resolveRowLink(item, onSelect, navigate);
    const location = resolveLocation(item, vaultNamesById, accountNamesById, accountThresholdsById);
    return (
      <VaultActivityRow
        key={`${item.view.key}:${item.vaultAccountId ?? ''}`}
        item={item}
        scale={scale}
        needsAttention={needsAttention(item)}
        location={location}
        href={link?.href}
        onClick={link?.onClick}
      />
    );
  }

  const tiers = [
    { label: 'Needs signatures', items: visibleItems.filter(item => tierOf(item) === 'action') },
    { label: 'In progress', items: visibleItems.filter(item => tierOf(item) === 'inFlight') },
    { label: 'History', items: visibleItems.filter(item => tierOf(item) === 'history') },
  ].filter(tier => tier.items.length > 0);

  // Labels only earn their place when they separate more than one tier; a feed
  // with a single tier (e.g. history only) renders as a plain list.
  const showLabels = tiers.length > 1;

  return (
    <ListContainer p="space.02">
      {tiers.map(tier => (
        <Box key={tier.label}>
          {showLabels ? <GroupLabel>{tier.label}</GroupLabel> : null}
          {tier.items.map(renderRow)}
        </Box>
      ))}
      {limit !== undefined && items.length > limit ? (
        <styled.p
          textStyle="caption.01"
          color="ink.text-subdued"
          textAlign="center"
          px="space.04"
          py="space.03"
        >
          Open an account to view its full history
        </styled.p>
      ) : null}
    </ListContainer>
  );
}
