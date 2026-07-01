import { Box, Flex, styled } from 'leather-styles/jsx';

import type { Vault, VaultMember } from '@leather.io/models';
import { Button, KeyIcon, ListItemBox, PaperPlaneIcon } from '@leather.io/ui';
import { truncateMiddle } from '@leather.io/utils';

import { AvatarCircle } from '../../components/avatar-circle';
import { Badge } from '../../components/badge';
import { CopyAddress } from '../../components/copy-address';
import { collectingSignaturesGradient } from '../../multisig-tokens';

interface MembersSectionProps {
  vault: Vault;
  currentUserAddress?: string;
  onShareInvite(): void;
}

function isCreatorMember(member: VaultMember, createdBy: string): boolean {
  return member.user?.id === createdBy;
}

function CreatorPill() {
  return (
    <Badge
      variant="default"
      icon={<KeyIcon variant="small" width={16} height={16} color="ink.text-subdued" />}
      label="Creator"
    />
  );
}

function MemberTrailing({
  member,
  isCreator,
  onShareInvite,
}: {
  member: VaultMember;
  isCreator: boolean;
  onShareInvite(): void;
}) {
  if (isCreator) return <CreatorPill />;
  if (member.membershipStatus === 'invited') {
    return (
      <Flex alignItems="center" gap="space.03">
        <Badge variant="pending" label="Invited" />
        <Button variant="outline" size="sm" iconStart={<PaperPlaneIcon />} onClick={onShareInvite}>
          Share invite
        </Button>
      </Flex>
    );
  }
  if (member.membershipStatus === 'declined') return <Badge variant="error" label="Declined" />;
  // Joined is the default, expected state — no badge (only the creator role and a
  // still-pending invite are worth calling out).
  return null;
}

export function MembersSection({ vault, currentUserAddress, onShareInvite }: MembersSectionProps) {
  return (
    <Box
      borderRadius="md"
      borderWidth="1px"
      borderStyle="solid"
      borderColor="ink.border-default"
      overflow="hidden"
    >
      {vault.members.map((member, index) => {
        const isCreator = isCreatorMember(member, vault.createdBy);
        const isMe = member.address === currentUserAddress;
        const isInvited = member.membershipStatus === 'invited';
        const displayName = isMe ? 'Me (you)' : member.name || truncateMiddle(member.address);
        return (
          <Box
            key={member.membershipId}
            p="space.04"
            borderTopWidth={index === 0 ? '0' : '1px'}
            borderTopStyle="solid"
            borderTopColor="ink.border-default"
            bgImage={isInvited ? collectingSignaturesGradient : undefined}
          >
            <ListItemBox
              variant="plain"
              leading={<AvatarCircle name={displayName} size="lg" />}
              title={<styled.span textStyle="label.02">{displayName}</styled.span>}
              caption={<CopyAddress addr={member.address} />}
              trailing={
                <MemberTrailing
                  member={member}
                  isCreator={isCreator}
                  onShareInvite={onShareInvite}
                />
              }
            />
          </Box>
        );
      })}
    </Box>
  );
}
