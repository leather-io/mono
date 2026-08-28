import { Box, styled } from 'leather-styles/jsx';

import type { Vault } from '@leather.io/models';
import {
  ArrowTopRightIcon,
  BasicTooltip,
  IconButton,
  ListItemBox,
  PencilIcon,
} from '@leather.io/ui';

import { AvatarSq } from '../../components/avatar-sq';
import { defaultVaultIcon, vaultThemeFromName } from '../../multisig-tokens';
import { chainFromNetwork } from '../../multisig.utils';

interface VaultStatusCardProps {
  vault: Vault;
  canCancel: boolean;
  isCancelling: boolean;
  pendingCount: number;
  onShareInvite(): void;
  onCancelVault(): void;
  onEdit?(): void;
}

function Row({ label, children }: { label: string; children?: React.ReactNode }) {
  return (
    <Box
      p="space.04"
      borderTopWidth="1px"
      borderTopStyle="solid"
      borderTopColor="ink.border-transparent"
    >
      <styled.div textStyle="label.03" color="ink.text-subdued">
        {label}
      </styled.div>
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
  onEdit,
}: VaultStatusCardProps) {
  const chain = chainFromNetwork(vault.network);
  const theme = vaultThemeFromName(vault.theme);
  const joined = vault.members.filter(member => member.membershipStatus === 'joined');
  const declined = vault.members.filter(member => member.membershipStatus === 'declined');
  const allJoined = joined.length === vault.members.length;

  return (
    <Box
      borderRadius="md"
      borderWidth="1px"
      borderStyle="solid"
      borderColor="ink.border-default"
      overflow="hidden"
    >
      <Box p="space.04">
        <ListItemBox
          variant="plain"
          density="compact"
          leading={
            <AvatarSq
              chain={chain}
              icon={vault.icon ?? defaultVaultIcon}
              themeId={theme.id}
              size="sm"
            />
          }
          title={vault.name}
          caption={`${chain === 'btc' ? 'Bitcoin' : 'Stacks'} vault`}
          trailing={
            onEdit ? (
              <BasicTooltip asChild label="Edit vault">
                <IconButton
                  icon={<PencilIcon variant="small" color="ink.text-subdued" />}
                  onClick={onEdit}
                  aria-label="Edit vault"
                  size="sm"
                />
              </BasicTooltip>
            ) : undefined
          }
        />
      </Box>

      <Row label="Status">
        <styled.div textStyle="body.02" color="ink.text-primary" mt="space.01">
          {allJoined ? 'All members joined' : `${joined.length} of ${vault.members.length} joined`}
        </styled.div>
        {pendingCount > 0 && (
          <Box
            mt="space.03"
            p="space.04"
            borderRadius="sm"
            bgImage="var(--multisig-collecting-wash)"
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
              Leather doesn&rsquo;t email or text invitees. Send each one through your own channel.
              The vault stays read-only until everyone joins.
            </styled.p>
          </Box>
        )}
      </Row>

      {declined.length > 0 && (
        <Box
          p="space.04"
          borderTopWidth="1px"
          borderTopStyle="solid"
          borderTopColor="ink.border-transparent"
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

      {canCancel && (
        <Box
          p="space.04"
          borderTopWidth="1px"
          borderTopStyle="solid"
          borderTopColor="ink.border-transparent"
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
