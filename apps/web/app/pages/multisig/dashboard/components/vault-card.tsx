import { Box, Flex, styled } from 'leather-styles/jsx';

import { AvatarSq } from '../../components/avatar-sq';
import { Badge } from '../../components/badge';
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
  return (
    <styled.button
      type="button"
      onClick={onClick}
      display="flex"
      alignItems="center"
      gap="space.04"
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
      <AvatarSq chain={vault.chain} icon="vault" themeId={vault.theme} size="md" />
      <Box flex={1} minWidth={0}>
        <Flex alignItems="center" justifyContent="space-between" gap="space.02">
          <styled.span textStyle="label.01" truncate>
            {vault.name}
          </styled.span>
          {!isInvite && !hasPending && (
            <styled.span textStyle="label.02">{formatUsd(vault.balanceUsd)}</styled.span>
          )}
          {hasPending && (
            <Badge
              variant="warning"
              label={`${invitedCount} pending invite${invitedCount === 1 ? '' : 's'}`}
            />
          )}
          {isInvite && <Badge variant="info" label="Invitation" />}
        </Flex>
        <Flex alignItems="center" justifyContent="space-between" gap="space.02" mt="space.01">
          <styled.span textStyle="caption.01" color="ink.text-subdued" truncate>
            {vault.chain === 'btc' ? 'Bitcoin' : 'Stacks'} vault · {vault.accounts.length}{' '}
            {vault.accounts.length === 1 ? 'account' : 'accounts'}
          </styled.span>
          <styled.span textStyle="caption.01" color="ink.text-subdued" flexShrink={0}>
            {hasPending ? 'Awaiting members' : vault.balanceSub}
          </styled.span>
        </Flex>
      </Box>
    </styled.button>
  );
}
