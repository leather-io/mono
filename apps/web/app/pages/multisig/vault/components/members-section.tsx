import { Box, Flex, styled } from 'leather-styles/jsx';
import { useBnsPrimaryNames } from '~/queries/bns/bns.query';

import type { Vault, VaultMember } from '@leather.io/models';
import { Button, KeyIcon, ListItemBox, PaperPlaneIcon } from '@leather.io/ui';
import { truncateMiddle } from '@leather.io/utils';

import { AvatarCircle } from '../../components/avatar-circle';
import { Badge } from '../../components/badge';
import { CopyAddress } from '../../components/copy-address';
import { EditableName } from '../../components/editable-name';

interface MembersSectionProps {
  vault: Vault;
  currentUserAddress?: string;
  currentUserIsCreator: boolean;
  onShareInvite(): void;
  onRenameMember(membershipId: string, name: string): void;
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

export function MembersSection({
  vault,
  currentUserAddress,
  currentUserIsCreator,
  onShareInvite,
  onRenameMember,
}: MembersSectionProps) {
  const isStacksMainnetVault = vault.network === 'stx:mainnet';
  const bnsPrimaryNames = useBnsPrimaryNames(
    isStacksMainnetVault ? vault.members.map(member => member.address) : []
  );
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
        const nameLabel = member.name || truncateMiddle(member.address);
        const canRename = currentUserIsCreator || isMe;
        const primaryBns = bnsPrimaryNames.get(member.address);
        const bnsToShow = primaryBns && primaryBns !== member.name ? primaryBns : undefined;
        const nameStyledDisplay = (
          <styled.span textStyle="label.02">
            {nameLabel}
            {isMe ? ' (you)' : ''}
            {bnsToShow ? (
              <styled.span color="ink.text-subdued" fontWeight="normal">
                {' · '}
                {bnsToShow}
              </styled.span>
            ) : null}
          </styled.span>
        );
        return (
          <Box
            key={member.membershipId}
            p="space.04"
            borderTopWidth={index === 0 ? '0' : '1px'}
            borderTopStyle="solid"
            borderTopColor="ink.border-default"
            bgImage={isInvited ? 'var(--multisig-collecting-wash)' : undefined}
          >
            <ListItemBox
              variant="plain"
              leading={<AvatarCircle name={nameLabel} size="lg" />}
              title={
                canRename ? (
                  <EditableName
                    value={member.name ?? ''}
                    display={nameStyledDisplay}
                    onSave={name => onRenameMember(member.membershipId, name)}
                    title="Rename member"
                    label="member name"
                    placeholder="Member name"
                  />
                ) : (
                  nameStyledDisplay
                )
              }
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
