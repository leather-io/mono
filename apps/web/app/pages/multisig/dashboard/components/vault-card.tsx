import { styled } from 'leather-styles/jsx';

import type { VaultSummary } from '@leather.io/models';

import { AvatarSq } from '../../components/avatar-sq';
import { Badge } from '../../components/badge';
import { VaultListItem } from '../../components/vault-list-item';
import { vaultThemeFromName } from '../../multisig-tokens';
import { chainFromNetwork } from '../../multisig.utils';

interface VaultCardProps {
  vault: VaultSummary;
  onClick(): void;
}

export function VaultCard({ vault, onClick }: VaultCardProps) {
  const chain = chainFromNetwork(vault.network);
  const chainLabel = chain === 'btc' ? 'Bitcoin' : 'Stacks';
  const accountLabel = vault.accountCount === 1 ? 'account' : 'accounts';
  const memberLabel = vault.memberCount === 1 ? 'member' : 'members';
  const isInvite = vault.membershipStatus === 'invited';
  const needsAttention = isInvite || vault.status === 'pending';
  const theme = vaultThemeFromName(vault.theme);

  function renderTrailingTitle() {
    if (isInvite) return <Badge variant="pending" label="Invitation" />;
    if (vault.status === 'pending') return <Badge variant="pending" label="Pending" />;
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
      bgImage={
        needsAttention
          ? 'linear-gradient(90deg, rgb(from token(colors.orange.action-primary-default) r g b / 0.16), rgb(from token(colors.orange.action-primary-default) r g b / 0) 70%)'
          : undefined
      }
      _hover={{ bg: 'ink.component-background-hover' }}
    >
      <VaultListItem
        leading={<AvatarSq chain={chain} icon="vault" themeId={theme.id} size="md" />}
        title={vault.name}
        caption={`${chainLabel} vault · ${vault.accountCount} ${accountLabel}`}
        trailingTitle={renderTrailingTitle()}
        trailingSubtitle={isInvite ? undefined : `${vault.memberCount} ${memberLabel}`}
      />
    </styled.button>
  );
}
