import { styled } from 'leather-styles/jsx';

import type { VaultSummary } from '@leather.io/models';

import { AvatarSq } from '../../components/avatar-sq';
import { Badge } from '../../components/badge';
import { VaultListItem } from '../../components/vault-list-item';
import type { Chain } from '../../data/multisig-types';
import { themeIdFromVaultId } from '../../multisig-tokens';

interface VaultCardProps {
  vault: VaultSummary;
  onClick(): void;
}

function chainFromNetwork(network: string): Chain {
  return network.startsWith('btc') ? 'btc' : 'stx';
}

export function VaultCard({ vault, onClick }: VaultCardProps) {
  const chain = chainFromNetwork(vault.network);
  const chainLabel = chain === 'btc' ? 'Bitcoin' : 'Stacks';
  const accountLabel = vault.accountCount === 1 ? 'account' : 'accounts';
  const memberLabel = vault.memberCount === 1 ? 'member' : 'members';
  const isInvite = vault.membershipStatus === 'invited';

  function renderTrailingTitle() {
    if (isInvite) return <Badge variant="info" label="Invitation" />;
    if (vault.status === 'pending') return <Badge variant="warning" label="Pending" />;
    if (vault.status === 'cancelled') return <Badge variant="error" label="Cancelled" />;
    return null;
  }

  return (
    <styled.button
      type="button"
      onClick={onClick}
      display="block"
      width="100%"
      textAlign="left"
      cursor="pointer"
      p="space.04"
      borderRadius="md"
      borderWidth="1px"
      borderStyle="solid"
      borderColor="ink.border-default"
      bg="ink.background-primary"
      _hover={{ bg: 'ink.component-background-hover' }}
    >
      <VaultListItem
        leading={
          <AvatarSq chain={chain} icon="vault" themeId={themeIdFromVaultId(vault.id)} size="md" />
        }
        title={vault.name}
        caption={`${chainLabel} vault · ${vault.accountCount} ${accountLabel}`}
        trailingTitle={renderTrailingTitle()}
        trailingSubtitle={isInvite ? undefined : `${vault.memberCount} ${memberLabel}`}
      />
    </styled.button>
  );
}
