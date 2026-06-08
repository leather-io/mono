import { Flex, styled } from 'leather-styles/jsx';

import { Button, Sheet, SheetHeader } from '@leather.io/ui';

import type { Vault } from '../data/multisig-types';
import { ShareInviteCard } from './components/share-invite-card';

interface ShareInvitesModalProps {
  vault: Vault;
  isShowing: boolean;
  onClose(): void;
}

export function ShareInvitesModal({ vault, isShowing, onClose }: ShareInvitesModalProps) {
  const invitedMembers = vault.members.filter(m => m.inviteStatus === 'invited');
  return (
    <Sheet
      isShowing={isShowing}
      onClose={onClose}
      header={<SheetHeader title="Share invites" />}
      footer={
        <Flex justifyContent="flex-end" width="100%">
          <Button variant="solid" onClick={onClose}>
            Done
          </Button>
        </Flex>
      }
    >
      <Flex direction="column" gap="space.04" px="space.05" pb="space.05">
        <styled.p textStyle="body.02" color="ink.text-subdued">
          Leather doesn't email or text invitees — send each link through your own channel. The
          vault stays read-only until everyone joins.
        </styled.p>
        {invitedMembers.length === 0 ? (
          <styled.div textStyle="body.02" color="ink.text-subdued" textAlign="center" py="space.06">
            All members have been invited.
          </styled.div>
        ) : (
          invitedMembers.map(member => (
            <ShareInviteCard key={member.addr} member={member} vault={vault} />
          ))
        )}
      </Flex>
    </Sheet>
  );
}
