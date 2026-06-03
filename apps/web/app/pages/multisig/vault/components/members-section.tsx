import { Box, Flex, styled } from 'leather-styles/jsx';

import { Button } from '@leather.io/ui';

import { AddressText } from '../../components/address-text';
import { AvatarCircle } from '../../components/avatar-circle';
import { MemberStatusPill } from '../../components/member-status-pill';
import { VaultListItem } from '../../components/vault-list-item';
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
        <Box
          key={member.addr}
          p="space.04"
          borderTopWidth={index === 0 ? '0' : '1px'}
          borderTopStyle="solid"
          borderTopColor="ink.border-default"
        >
          <VaultListItem
            leading={<AvatarCircle name={member.name} size="lg" />}
            title={`${member.name}${member.isCreator ? ' (you)' : ''}`}
            caption={
              member.handle ? (
                <Flex alignItems="center" gap="space.01" minWidth={0}>
                  <styled.span textStyle="caption.01" color="ink.text-subdued" flexShrink={0}>
                    {member.handle} ·
                  </styled.span>
                  <Box minWidth={0}>
                    <AddressText addr={member.addr} />
                  </Box>
                </Flex>
              ) : (
                <AddressText addr={member.addr} />
              )
            }
            trailingTitle={
              <Flex alignItems="center" gap="space.02">
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
            }
          />
        </Box>
      ))}
    </Box>
  );
}
