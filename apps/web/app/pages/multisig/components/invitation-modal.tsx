import { Box, Flex, styled } from 'leather-styles/jsx';
import { useSession } from '~/features/multisig/auth/use-session';
import { useDeclineVault, useJoinVault } from '~/features/multisig/vaults/use-vault-mutations';
import { useVault } from '~/features/multisig/vaults/use-vaults';

import type { VaultMember, VaultSummary } from '@leather.io/models';
import { Button, Sheet, SheetHeader } from '@leather.io/ui';
import { truncateMiddle } from '@leather.io/utils';

import type { Chain } from '../data/multisig-types';
import { themeIdFromVaultId, vaultTheme } from '../multisig-tokens';
import { AvatarCircle } from './avatar-circle';
import { AvatarSq } from './avatar-sq';
import { VaultListItem } from './vault-list-item';

interface InvitationModalProps {
  vault: VaultSummary;
  isShowing: boolean;
  onClose(): void;
}

function chainFromNetwork(network: string): Chain {
  return network.startsWith('btc') ? 'btc' : 'stx';
}

function memberStatusLabel(member: VaultMember, currentUserAddress?: string): string {
  if (member.address === currentUserAddress) return 'You';
  if (member.membershipStatus === 'joined') return 'Joined';
  if (member.membershipStatus === 'declined') return 'Declined';
  return 'Pending';
}

export function InvitationModal({ vault, isShowing, onClose }: InvitationModalProps) {
  const { network } = vault;
  const detail = useVault(network, vault.id);
  const session = useSession(network);
  const joinVault = useJoinVault(network);
  const declineVault = useDeclineVault(network);

  const myAddress = session?.identity.address;
  const members = detail.data?.members ?? [];
  const myMembership = members.find(member => member.address === myAddress);
  const creator = members.find(
    member => member.user?.id === vault.createdBy || member.address === vault.createdBy
  );
  const pendingCount = members.filter(member => member.membershipStatus === 'invited').length;
  const theme = vaultTheme(themeIdFromVaultId(vault.id));
  const chain = chainFromNetwork(network);

  function accept() {
    if (!myMembership) return;
    joinVault.mutate(myMembership.membershipId, { onSuccess: onClose });
  }
  function decline() {
    if (!myMembership) return;
    declineVault.mutate(myMembership.membershipId, { onSuccess: onClose });
  }

  return (
    <Sheet
      isShowing={isShowing}
      onClose={onClose}
      header={<SheetHeader title="You're invited to a vault" />}
      footer={
        <Flex gap="space.03" justifyContent="flex-end" width="100%">
          <Button variant="outline" aria-busy={declineVault.isPending} onClick={decline}>
            Decline
          </Button>
          <Button variant="solid" aria-busy={joinVault.isPending} onClick={accept}>
            Accept invitation
          </Button>
        </Flex>
      }
    >
      <Flex direction="column" gap="space.04" px="space.05" pb="space.05">
        <Flex
          alignItems="center"
          gap="space.04"
          p="space.05"
          borderRadius="md"
          color={theme.dark ? 'white' : 'ink.text-primary'}
          style={{ background: theme.background }}
        >
          <AvatarSq
            chain={chain}
            icon="vault"
            themeId={themeIdFromVaultId(vault.id)}
            size="lg"
            withChainBadge={false}
          />
          <Box minWidth={0}>
            <styled.div textStyle="heading.05">{vault.name}</styled.div>
            <styled.div textStyle="caption.01" opacity={0.85}>
              {creator ? `Invited by ${truncateMiddle(creator.address)} · ` : ''}
              {vault.memberCount} members · thresholds set per account
            </styled.div>
          </Box>
        </Flex>

        <Box
          borderRadius="md"
          borderWidth="1px"
          borderStyle="solid"
          borderColor="ink.border-default"
          overflow="hidden"
        >
          {members.map((member, index) => (
            <Box
              key={member.membershipId}
              p="space.04"
              borderTopWidth={index === 0 ? '0' : '1px'}
              borderTopStyle="solid"
              borderTopColor="ink.border-default"
            >
              <VaultListItem
                leading={<AvatarCircle name={member.address} size="lg" />}
                title={`${truncateMiddle(member.address)}${
                  member.address === myAddress ? ' (me)' : ''
                }`}
                trailingTitle={
                  <styled.span textStyle="caption.01" color="ink.text-subdued">
                    {memberStatusLabel(member, myAddress)}
                  </styled.span>
                }
              />
            </Box>
          ))}
        </Box>

        {pendingCount > 0 && (
          <styled.p textStyle="caption.01" color="ink.text-subdued">
            Once {pendingCount} more {pendingCount === 1 ? 'member accepts' : 'members accept'}, the
            vault becomes active. Anyone in the vault can then create accounts — each account sets
            its own signing threshold (M-of-N).
          </styled.p>
        )}
      </Flex>
    </Sheet>
  );
}
