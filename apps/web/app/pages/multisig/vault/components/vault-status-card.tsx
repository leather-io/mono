import { Box, Flex, styled } from 'leather-styles/jsx';

import { Button } from '@leather.io/ui';

import { AvatarSq } from '../../components/avatar-sq';
import { VaultListItem } from '../../components/vault-list-item';
import type { Vault } from '../../data/multisig-types';

interface VaultStatusCardProps {
  vault: Vault;
  onShareInvites(): void;
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

export function VaultStatusCard({ vault, onShareInvites, onCancelVault }: VaultStatusCardProps) {
  const invited = vault.members.filter(m => m.inviteStatus === 'invited');
  const declined = vault.members.filter(m => m.inviteStatus === 'declined');
  const joined = vault.members.filter(m => m.inviteStatus === 'joined');
  const threshold = vault.accounts[0]?.threshold ?? [vault.members.length, vault.members.length];
  const allJoined = joined.length === vault.members.length;
  const canCancel = vault.status === 'pending';

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
              chain={vault.chain}
              icon="vault"
              themeId={vault.theme}
              size="md"
              withChainBadge={false}
            />
          }
          title={vault.name}
          caption={`${vault.chain === 'btc' ? 'Bitcoin' : 'Stacks'} vault`}
        />
      </Box>

      <Row label="Threshold" value={`${threshold[0]} of ${threshold[1]}`}>
        <styled.div textStyle="caption.01" color="ink.text-subdued" mt="space.01">
          Any {threshold[0]} of {threshold[1]} members must approve transactions in this vault.
        </styled.div>
      </Row>

      <Row label="Status" value={vault.status === 'pending' ? 'Pending' : 'Active'}>
        <styled.div textStyle="caption.01" color="ink.text-subdued" mt="space.01">
          {allJoined ? 'All members joined' : `${joined.length} of ${vault.members.length} joined`}
        </styled.div>
      </Row>

      {invited.length > 0 && (
        <Box
          p="space.04"
          borderTopWidth="1px"
          borderTopStyle="solid"
          borderTopColor="ink.border-default"
        >
          <Button variant="solid" fullWidth onClick={onShareInvites}>
            Share {invited.length} pending invite{invited.length === 1 ? '' : 's'}
          </Button>
          <styled.div textStyle="caption.01" color="ink.text-subdued" mt="space.02">
            Leather doesn't email or text invitees — send each one through your own channel. The
            vault stays read-only until everyone joins.
          </styled.div>
        </Box>
      )}

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
          <Button variant="outline" fullWidth onClick={onCancelVault}>
            Cancel vault
          </Button>
        </Box>
      )}
    </Box>
  );
}
