import { styled } from 'leather-styles/jsx';

import { AvatarSq } from '../../components/avatar-sq';
import { Badge } from '../../components/badge';
import { VaultListItem } from '../../components/vault-list-item';
import type { Vault } from '../../data/multisig-types';

interface VaultCardProps {
  vault: Vault;
  onClick(): void;
}

function formatUsd(amount: number): string {
  return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function VaultCard({ vault, onClick }: VaultCardProps) {
  const isInvite = vault.invited;
  const invitedCount = vault.members.filter(m => m.inviteStatus === 'invited').length;
  const hasPending = !isInvite && invitedCount > 0;

  function renderTrailingTitle() {
    if (isInvite) return <Badge variant="info" label="Invitation" />;
    if (hasPending) {
      return (
        <Badge
          variant="warning"
          label={`${invitedCount} pending invite${invitedCount === 1 ? '' : 's'}`}
        />
      );
    }
    return formatUsd(vault.balanceUsd);
  }

  const chainLabel = vault.chain === 'btc' ? 'Bitcoin' : 'Stacks';
  const accountLabel = vault.accounts.length === 1 ? 'account' : 'accounts';

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
        leading={<AvatarSq chain={vault.chain} icon="vault" themeId={vault.theme} size="md" />}
        title={vault.name}
        caption={`${chainLabel} vault · ${vault.accounts.length} ${accountLabel}`}
        trailingTitle={renderTrailingTitle()}
        trailingSubtitle={hasPending ? 'Awaiting members' : vault.balanceSub}
      />
    </styled.button>
  );
}
