import { Box, Flex, styled } from 'leather-styles/jsx';

import type { Vault } from '@leather.io/models';
import { Button } from '@leather.io/ui';

import { AvatarSq } from '../../components/avatar-sq';
import { VaultListItem } from '../../components/vault-list-item';
import { vaultThemeFromName } from '../../multisig-tokens';
import { chainFromNetwork } from '../../multisig.utils';

interface VaultStatusCardProps {
  vault: Vault;
  canCancel: boolean;
  isCancelling: boolean;
  onCancelVault(): void;
}

function Row({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <Box
      p="space.04"
      borderTopWidth="1px"
      borderTopStyle="solid"
      borderTopColor="ink.border-default"
    >
      <Flex justifyContent="space-between" alignItems="center" gap="space.02">
        <styled.span textStyle="label.02">{label}</styled.span>
        {value && (
          <styled.span textStyle="caption.01" color="ink.text-subdued">
            {value}
          </styled.span>
        )}
      </Flex>
      {children}
    </Box>
  );
}

export function VaultStatusCard({
  vault,
  canCancel,
  isCancelling,
  onCancelVault,
}: VaultStatusCardProps) {
  const chain = chainFromNetwork(vault.network);
  const theme =
    typeof vaultThemeFromName === 'function'
      ? vaultThemeFromName(vault.theme)
      : { id: vault.theme };
  const joined = vault.members.filter(member => member.membershipStatus === 'joined');
  const declined = vault.members.filter(member => member.membershipStatus === 'declined');
  const allJoined = joined.length === vault.members.length;
  const statusLabel = vault.status.charAt(0).toUpperCase() + vault.status.slice(1);

  return (
    <Box
      borderRadius="md"
      borderWidth="1px"
      borderStyle="solid"
      borderColor="ink.border-default"
      overflow="hidden"
    >
      <Box p="space.04">
        <VaultListItem
          leading={
            <AvatarSq
              chain={chain}
              icon="vault"
              themeId={theme.id}
              size="md"
              withChainBadge={false}
            />
          }
          title={vault.name}
          caption={`${chain === 'btc' ? 'Bitcoin' : 'Stacks'} vault`}
        />
      </Box>

      <Row label="Status" value={statusLabel}>
        <styled.div textStyle="caption.01" color="ink.text-subdued" mt="space.01">
          {allJoined ? 'All members joined' : `${joined.length} of ${vault.members.length} joined`}
        </styled.div>
      </Row>

      {declined.length > 0 && (
        <Box
          p="space.04"
          borderTopWidth="1px"
          borderTopStyle="solid"
          borderTopColor="ink.border-default"
        >
          <styled.div textStyle="label.03" color="red.action-primary-default">
            {declined.length} member{declined.length === 1 ? '' : 's'} declined
          </styled.div>
          <styled.div textStyle="caption.01" color="ink.text-subdued" mt="space.01">
            Once a member declines, this vault can't activate. The creator can cancel and start
            over.
          </styled.div>
        </Box>
      )}

      {canCancel && (
        <Box
          p="space.04"
          borderTopWidth="1px"
          borderTopStyle="solid"
          borderTopColor="ink.border-default"
        >
          <Button
            variant="outline"
            fullWidth
            disabled={isCancelling}
            aria-busy={isCancelling}
            onClick={onCancelVault}
          >
            Cancel vault
          </Button>
        </Box>
      )}
    </Box>
  );
}
