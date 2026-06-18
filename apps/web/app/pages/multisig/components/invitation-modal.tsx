import { Box, Flex, styled } from 'leather-styles/jsx';
import { useSession } from '~/features/multisig/auth/use-session';
import { useDeclineVault, useJoinVault } from '~/features/multisig/vaults/use-vault-mutations';
import { useVault } from '~/features/multisig/vaults/use-vaults';

import type { VaultMember, VaultSummary } from '@leather.io/models';
import { Button, CloseIcon, IconButton, Sheet } from '@leather.io/ui';
import { truncateMiddle } from '@leather.io/utils';

import { vaultThemeFromName } from '../multisig-tokens';
import { chainFromNetwork } from '../multisig.utils';
import { AvatarCircle } from './avatar-circle';
import { AvatarSq } from './avatar-sq';
import { CopyAddress } from './copy-address';
import { VaultListItem } from './vault-list-item';

interface InvitationModalProps {
  vault: VaultSummary;
  isShowing: boolean;
  onClose(): void;
}

function memberStatusLabel(member: VaultMember, currentUserAddress?: string): string {
  if (member.address === currentUserAddress) return 'You';
  if (member.membershipStatus === 'joined') return 'Joined';
  if (member.membershipStatus === 'declined') return 'Declined';
  return 'Pending';
}

function InvitationHeader({ onClose }: { onClose?(): void }) {
  return (
    <Flex
      alignItems="center"
      justifyContent="space-between"
      gap="space.04"
      px="space.05"
      py="space.04"
      width="100%"
      minHeight="headerHeight"
    >
      <styled.h2 textStyle="heading.05">You're invited to a vault</styled.h2>
      {onClose && <IconButton icon={<CloseIcon />} onClick={onClose} />}
    </Flex>
  );
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
  const creator = members.find(member => member.user?.id === vault.createdBy);
  const pendingCount = members.filter(member => member.membershipStatus === 'invited').length;
  const othersPending = pendingCount - (myMembership?.membershipStatus === 'invited' ? 1 : 0);
  const theme = vaultThemeFromName(vault.theme);
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
      header={<InvitationHeader />}
      footer={
        <Flex gap="space.03" justifyContent="flex-end" width="100%">
          <Button
            variant="outline"
            disabled={!myMembership || joinVault.isPending || declineVault.isPending}
            aria-busy={declineVault.isPending}
            onClick={decline}
          >
            Decline
          </Button>
          <Button
            variant="solid"
            disabled={!myMembership || joinVault.isPending || declineVault.isPending}
            aria-busy={joinVault.isPending}
            onClick={accept}
          >
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
          <AvatarSq chain={chain} icon="vault" themeId={theme.id} size="lg" />
          <Box minWidth={0}>
            <styled.div textStyle="heading.05">{vault.name}</styled.div>
            <styled.div textStyle="caption.01" opacity={0.85}>
              {creator && (
                <>
                  Invited by{' '}
                  <styled.span fontWeight="bold">
                    {creator.name || truncateMiddle(creator.address)}
                  </styled.span>
                  {' · '}
                </>
              )}
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
          {!detail.data
            ? Array.from({ length: vault.memberCount || 2 }).map((_unused, index) => (
                <Box
                  key={index}
                  p="space.04"
                  borderTopWidth={index === 0 ? '0' : '1px'}
                  borderTopStyle="solid"
                  borderTopColor="ink.border-default"
                >
                  <Box
                    height="40px"
                    borderRadius="sm"
                    bg="ink.component-background-default"
                    opacity={0.6}
                  />
                </Box>
              ))
            : members.map((member, index) => (
                <Box
                  key={member.membershipId}
                  p="space.04"
                  borderTopWidth={index === 0 ? '0' : '1px'}
                  borderTopStyle="solid"
                  borderTopColor="ink.border-default"
                >
                  <VaultListItem
                    tightLeading
                    leading={<AvatarCircle name={member.name || member.address} size="lg" />}
                    title={
                      <styled.span pl="space.02" textStyle="label.02">
                        {`${member.name || truncateMiddle(member.address)}${
                          member.address === myAddress ? ' (me)' : ''
                        }`}
                      </styled.span>
                    }
                    caption={
                      member.name ? <CopyAddress addr={member.address} emphasis /> : undefined
                    }
                    trailingTitle={
                      <styled.span textStyle="caption.01" color="ink.text-subdued">
                        {memberStatusLabel(member, myAddress)}
                      </styled.span>
                    }
                  />
                </Box>
              ))}
        </Box>

        {othersPending > 0 && (
          <styled.p textStyle="caption.01" color="ink.text-subdued">
            Once {othersPending} more {othersPending === 1 ? 'member accepts' : 'members accept'},
            the vault becomes active. Anyone in the vault can then create accounts — each account
            sets its own signing threshold (M-of-N).
          </styled.p>
        )}
      </Flex>
    </Sheet>
  );
}
