import { Box, Flex, styled } from 'leather-styles/jsx';

import type { Vault, VaultMember } from '@leather.io/models';
import { ArrowTopRightIcon, Button, KeyIcon } from '@leather.io/ui';
import { truncateMiddle } from '@leather.io/utils';

import { AvatarCircle } from '../../components/avatar-circle';
import { Badge } from '../../components/badge';
import { CopyAddress } from '../../components/copy-address';
import { VaultListItem } from '../../components/vault-list-item';

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
    <Flex
      alignItems="center"
      gap="space.01"
      height="16px"
      pl="space.01"
      pr="space.02"
      borderRadius="round"
      bg="ink.background-secondary"
      color="ink.text-subdued"
      textStyle="label.03"
      fontSize="11px"
    >
      <KeyIcon variant="small" color="ink.text-subdued" width={12} height={12} />
      <styled.span position="relative" top="1px">
        Creator
      </styled.span>
    </Flex>
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
        <Button
          variant="outline"
          size="sm"
          height="30px"
          px="space.03"
          textStyle="label.03"
          onClick={onShareInvite}
        >
          <Flex alignItems="center" gap="space.01">
            <ArrowTopRightIcon variant="small" />
            Share invite
          </Flex>
        </Button>
      </Flex>
    );
  }
  if (member.membershipStatus === 'declined') return <Badge variant="error" label="Declined" />;
  return <Badge variant="success" label="Joined" />;
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
            bgImage={
              isInvited
                ? 'linear-gradient(90deg, rgb(from token(colors.orange.action-primary-default) r g b / 0.16), rgb(from token(colors.orange.action-primary-default) r g b / 0) 70%)'
                : undefined
            }
          >
            <VaultListItem
              tightLeading
              leading={<AvatarCircle name={displayName} size="lg" />}
              title={
                <styled.span pl="space.02" textStyle="label.02">
                  {displayName}
                </styled.span>
              }
              caption={<CopyAddress addr={member.address} />}
              trailingTitle={
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
