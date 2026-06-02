import { Box, Flex, styled } from 'leather-styles/jsx';

import { Button, Sheet, SheetHeader } from '@leather.io/ui';

import { AvatarCircle } from '../components/avatar-circle';
import { AvatarSq } from '../components/avatar-sq';
import { CopyAddress } from '../components/copy-address';
import { useMultisigToast } from '../components/multisig-toast';
import type { Vault } from '../data/multisig-types';
import { vaultTheme } from '../multisig-tokens';
import { useMultisigActions } from '../store/use-multisig';

interface InviteAcceptModalProps {
  vault: Vault;
  isShowing: boolean;
  onClose(): void;
}

export function InviteAcceptModal({ vault, isShowing, onClose }: InviteAcceptModalProps) {
  const { acceptInvite, declineInvite } = useMultisigActions();
  const { showToast } = useMultisigToast();
  const theme = vaultTheme(vault.theme);

  function accept() {
    acceptInvite(vault.id);
    showToast(`Joined “${vault.name}”`);
    onClose();
  }
  function decline() {
    declineInvite(vault.id);
    showToast(`Declined “${vault.name}”`);
    onClose();
  }

  return (
    <Sheet
      isShowing={isShowing}
      onClose={onClose}
      header={<SheetHeader title="You're invited to a vault" />}
      footer={
        <Flex gap="space.03" justifyContent="flex-end" width="100%">
          <Button variant="outline" onClick={decline}>
            Decline
          </Button>
          <Button variant="solid" onClick={accept}>
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
            chain={vault.chain}
            icon="vault"
            themeId={vault.theme}
            size="lg"
            withChainBadge={false}
          />
          <Box>
            <styled.div textStyle="heading.05">{vault.name}</styled.div>
            <styled.div textStyle="caption.01" opacity={0.85}>
              Invited by {vault.inviter} · {vault.members.length} members
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
          {vault.members.map((member, index) => (
            <Flex
              key={member.addr}
              alignItems="center"
              gap="space.03"
              p="space.04"
              borderTopWidth={index === 0 ? '0' : '1px'}
              borderTopStyle="solid"
              borderTopColor="ink.border-default"
            >
              <AvatarCircle name={member.name} size="sm" />
              <Box flex={1} minWidth={0}>
                <styled.div textStyle="label.02">
                  {member.name}
                  {member.isCreator ? ' (you)' : ''}
                </styled.div>
                <CopyAddress addr={member.addr} />
              </Box>
              <styled.span textStyle="caption.01" color="ink.text-subdued">
                {member.inviteStatus === 'joined' ? 'Joined' : 'Pending'}
              </styled.span>
            </Flex>
          ))}
        </Box>

        <styled.p textStyle="caption.01" color="ink.text-subdued">
          Once the remaining members accept, the vault becomes active. Anyone in the vault can then
          create accounts — each account sets its own signing threshold.
        </styled.p>
      </Flex>
    </Sheet>
  );
}
