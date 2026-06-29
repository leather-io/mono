import { Box, Flex, styled } from 'leather-styles/jsx';

import type { Vault } from '@leather.io/models';
import { ArrowTopRightIcon, ListItemBox } from '@leather.io/ui';

import { AvatarSq } from '../../components/avatar-sq';
import { vaultThemeFromName } from '../../multisig-tokens';
import { chainFromNetwork } from '../../multisig.utils';

interface VaultStatusCardProps {
  vault: Vault;
  canCancel: boolean;
  isCancelling: boolean;
  pendingCount: number;
  onShareInvite(): void;
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
        <styled.span textStyle="label.03" color="ink.text-subdued">
          {label}
        </styled.span>
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
  pendingCount,
  onShareInvite,
  onCancelVault,
}: VaultStatusCardProps) {
  const chain = chainFromNetwork(vault.network);
  const theme = vaultThemeFromName(vault.theme);
  const joined = vault.members.filter(member => member.membershipStatus === 'joined');
  const declined = vault.members.filter(member => member.membershipStatus === 'declined');
  const allJoined = joined.length === vault.members.length;
  const statusLabel = vault.status.charAt(0).toUpperCase() + vault.status.slice(1);

  return (
    <Box
      borderRadius="md"
      borderWidth="1px"
      borderStyle="solid"
      borderColor={vault.status === 'pending' ? 'yellow.border' : 'ink.border-default'}
      overflow="hidden"
    >
      <Box p="space.04">
        <ListItemBox
          variant="plain"
          density="compact"
          leading={<AvatarSq chain={chain} icon="vault" themeId={theme.id} size="sm" />}
          title={<styled.span textStyle="label.03">{vault.name}</styled.span>}
          caption={`${chain === 'btc' ? 'Bitcoin' : 'Stacks'} vault`}
        />
      </Box>

      <Row label="Status" value={statusLabel}>
        <styled.div textStyle="caption.01" color="ink.text-primary" mt="space.01">
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
            {vault.status === 'cancelled'
              ? 'Because a member declined, this vault was cancelled.'
              : "Once a member declines, this vault can't activate. The creator can cancel and start over."}
          </styled.div>
        </Box>
      )}

      {pendingCount > 0 && (
        <Box
          p="space.04"
          borderTopWidth="1px"
          borderTopStyle="solid"
          borderTopColor="ink.border-default"
          bg="yellow.background-primary"
        >
          <styled.button
            type="button"
            onClick={onShareInvite}
            width="100%"
            height="32px"
            borderRadius="round"
            bg="ink.action-primary-default"
            color="ink.background-primary"
            textStyle="label.02"
            cursor="pointer"
            display="flex"
            alignItems="center"
            justifyContent="center"
            gap="space.02"
            _hover={{ bg: 'ink.action-primary-hover' }}
          >
            <ArrowTopRightIcon variant="small" color="ink.background-primary" />
            Share {pendingCount} pending {pendingCount === 1 ? 'invite' : 'invites'}
          </styled.button>
          <styled.p textStyle="caption.01" color="ink.text-subdued" mt="space.03">
            Leather doesn't email or text invitees. Send each one through your own channel. The
            vault stays read-only until everyone joins.
          </styled.p>
        </Box>
      )}

      {canCancel && (
        <Box
          p="space.04"
          borderTopWidth="1px"
          borderTopStyle="solid"
          borderTopColor="ink.border-default"
        >
          <styled.button
            type="button"
            disabled={isCancelling}
            aria-busy={isCancelling}
            onClick={onCancelVault}
            width="100%"
            height="32px"
            borderRadius="round"
            borderWidth="1px"
            borderStyle="solid"
            borderColor="red.border"
            bg="transparent"
            color="red.action-primary-default"
            textStyle="label.02"
            cursor="pointer"
            _hover={{ bg: 'red.background-primary' }}
            _disabled={{ cursor: 'not-allowed', opacity: 0.6 }}
          >
            Cancel vault
          </styled.button>
        </Box>
      )}
    </Box>
  );
}
