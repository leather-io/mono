import { Box } from 'leather-styles/jsx';

import type { Vault, VaultMember } from '@leather.io/models';
import { truncateMiddle } from '@leather.io/utils';

import { AvatarCircle } from '../../components/avatar-circle';
import { MemberStatusPill } from '../../components/member-status-pill';
import { VaultListItem } from '../../components/vault-list-item';

interface MembersSectionProps {
  vault: Vault;
  currentUserAddress?: string;
}

function isCreatorMember(member: VaultMember, createdBy: string): boolean {
  return member.user?.id === createdBy;
}

export function MembersSection({ vault, currentUserAddress }: MembersSectionProps) {
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
        return (
          <Box
            key={member.membershipId}
            p="space.04"
            borderTopWidth={index === 0 ? '0' : '1px'}
            borderTopStyle="solid"
            borderTopColor="ink.border-default"
          >
            <VaultListItem
              leading={<AvatarCircle name={member.name || member.address} size="lg" />}
              title={`${member.name || truncateMiddle(member.address)}${isMe ? ' (you)' : ''}`}
              trailingTitle={
                <MemberStatusPill status={member.membershipStatus} isCreator={isCreator} />
              }
            />
          </Box>
        );
      })}
    </Box>
  );
}
