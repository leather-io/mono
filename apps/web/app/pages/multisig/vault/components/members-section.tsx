import { Box, Flex, styled } from 'leather-styles/jsx';

import { Button } from '@leather.io/ui';

import { AddressText } from '../../components/address-text';
import { AvatarCircle } from '../../components/avatar-circle';
import { MemberStatusPill } from '../../components/member-status-pill';
import type { Member, Vault } from '../../data/multisig-types';

interface MembersSectionProps {
  vault: Vault;
  onShareInvite(member: Member): void;
}

export function MembersSection({ vault, onShareInvite }: MembersSectionProps) {
  return (
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
            <Flex alignItems="center" gap="space.02" flexWrap="wrap">
              <styled.span textStyle="label.02">
                {member.name}
                {member.isCreator ? ' (you)' : ''}
              </styled.span>
              {member.handle && (
                <styled.span textStyle="caption.01" color="ink.text-subdued">
                  · {member.handle}
                </styled.span>
              )}
            </Flex>
            <Box maxWidth="100%">
              <AddressText addr={member.addr} />
            </Box>
          </Box>
          <MemberStatusPill
            status={member.inviteStatus}
            joinedAt={member.joinedAt}
            isCreator={member.isCreator}
          />
          {member.inviteStatus === 'invited' && (
            <Button variant="outline" onClick={() => onShareInvite(member)}>
              Share invite
            </Button>
          )}
        </Flex>
      ))}
    </Box>
  );
}
