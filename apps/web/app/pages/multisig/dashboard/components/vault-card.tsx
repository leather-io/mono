import { type ReactNode } from 'react';

import { styled } from 'leather-styles/jsx';
import { Balance } from '~/components/balance/balance';
import { useVaultAccountsBalance } from '~/features/multisig/vaults/use-vault-account-balance';
import { useVaultAccountRecovery } from '~/features/multisig/vaults/use-vault-account-mutations';
import { useVaultAccounts } from '~/features/multisig/vaults/use-vault-accounts';
import { useVault } from '~/features/multisig/vaults/use-vaults';
import { formatCryptoGlanceable, formatCurrency } from '~/utils/currency-formatter';

import type { VaultSummary } from '@leather.io/models';
import { ListItemBox } from '@leather.io/ui';
import { createMoney, truncateMiddle } from '@leather.io/utils';

import { AvatarSq } from '../../components/avatar-sq';
import { Badge } from '../../components/badge';
import { defaultVaultIcon, vaultThemeFromName } from '../../multisig-tokens';
import { chainFromNetwork } from '../../multisig.utils';

interface VaultCardProps {
  vault: VaultSummary;
  onClick(): void;
}

interface TrailingContent {
  title: ReactNode;
  subtitle: ReactNode;
}

export function VaultCard({ vault, onClick }: VaultCardProps) {
  const chain = chainFromNetwork(vault.network);
  const chainLabel = chain === 'btc' ? 'Bitcoin' : 'Stacks';
  const accountLabel = vault.accountCount === 1 ? 'account' : 'accounts';
  const isInvite = vault.membershipStatus === 'invited';
  const isCancelled = vault.status === 'cancelled';
  const isPendingMember = vault.membershipStatus === 'joined' && vault.status === 'pending';
  const isActive = vault.membershipStatus === 'joined' && vault.status === 'active';
  const needsAttention = isInvite || vault.status === 'pending';
  const theme = vaultThemeFromName(vault.theme);

  const accounts = useVaultAccounts(vault.network, isActive ? vault.id : undefined);
  const accountRecovery = useVaultAccountRecovery(vault.network, vault.id);
  const { crypto, fiat } = useVaultAccountsBalance(accounts.data);
  const detail = useVault(vault.network, isPendingMember || isInvite ? vault.id : undefined);
  const pendingInviteCount =
    detail.data?.members.filter(member => member.membershipStatus === 'invited').length ?? 0;
  const inviter = detail.data?.members.find(member => member.user?.id === vault.createdBy);
  const inviterName = inviter ? inviter.name || truncateMiddle(inviter.address) : null;

  function renderTrailing(): TrailingContent {
    if (isCancelled) {
      return { title: <Badge variant="error" label="Cancelled" />, subtitle: undefined };
    }
    if (isInvite) {
      return {
        title: <Badge variant="pending" label="Invitation" />,
        subtitle: undefined,
      };
    }
    if (isPendingMember) {
      const label =
        pendingInviteCount > 0
          ? `${pendingInviteCount} pending ${pendingInviteCount === 1 ? 'invite' : 'invites'}`
          : 'Pending';
      return {
        title: <Badge variant="pending" label={label} />,
        subtitle: undefined,
      };
    }
    const hasNoAccounts = vault.accountCount === 0;
    const fiatBalance = hasNoAccounts ? createMoney(0, 'USD') : fiat;
    const cryptoBalance = hasNoAccounts ? createMoney(0, chain === 'btc' ? 'BTC' : 'STX') : crypto;
    return {
      title: (
        <Balance balance={fiatBalance} formatCurrency={formatCurrency} textStyle="heading.05" />
      ),
      subtitle: (
        <Balance
          balance={cryptoBalance}
          formatCurrency={formatCryptoGlanceable}
          textStyle="caption.01"
          color="ink.text-subdued"
        />
      ),
    };
  }

  const trailing = renderTrailing();

  function renderCaption(): string {
    if (accountRecovery.isRecovering) return `${chainLabel} vault · Scanning for accounts…`;
    if (isInvite && inviterName) return `${chainLabel} vault · Invited by ${inviterName}`;
    return `${chainLabel} vault · ${vault.accountCount} ${accountLabel}`;
  }

  return (
    <styled.button
      type="button"
      onClick={isCancelled ? undefined : onClick}
      disabled={isCancelled}
      display="block"
      width="100%"
      textAlign="left"
      cursor={isCancelled ? 'default' : 'pointer'}
      p="space.04"
      borderRadius="md"
      borderWidth="1px"
      borderStyle="solid"
      borderColor="ink.border-default"
      bg="ink.background-primary"
      bgImage={needsAttention ? 'var(--multisig-collecting-wash)' : undefined}
      _hover={
        needsAttention
          ? { bgImage: 'var(--multisig-collecting-wash-hover)' }
          : { bg: 'ink.component-background-hover' }
      }
      _disabled={{ cursor: 'default' }}
    >
      <ListItemBox
        variant="plain"
        leading={
          <AvatarSq
            chain={chain}
            icon={vault.icon ?? defaultVaultIcon}
            themeId={theme.id}
            size="md"
          />
        }
        title={<styled.span textStyle="heading.05">{vault.name}</styled.span>}
        caption={renderCaption()}
        trailing={trailing.title}
        trailingCaption={trailing.subtitle}
      />
    </styled.button>
  );
}
