import { useState } from 'react';

import { Box, Flex, styled } from 'leather-styles/jsx';
import { useToast } from '~/features/toasts/use-toast';

import type { Vault, VaultMember } from '@leather.io/models';
import { Button, ChevronDownIcon, CloseIcon, CopyIcon, IconButton, Sheet } from '@leather.io/ui';
import { truncateMiddle } from '@leather.io/utils';

import { AvatarCircle } from '../../components/avatar-circle';
import { Badge } from '../../components/badge';
import { CopyAddress } from '../../components/copy-address';
import { chainFromNetwork } from '../../multisig.utils';

interface ShareInvitationsModalProps {
  vault: Vault;
  currentUserAddress?: string;
  isShowing: boolean;
  onClose(): void;
}

function inviteLink(vault: Vault): string {
  return `https://leather.io/multisig?invite=${vault.id}`;
}

function inviteMessage(vault: Vault, member: VaultMember, creatorName: string | null): string {
  const chainLabel = chainFromNetwork(vault.network) === 'btc' ? 'Bitcoin' : 'Stacks';
  const name = member.name || 'there';
  const lines = [
    `Hey ${name},`,
    '',
    `You're invited to "${vault.name}", a ${chainLabel} multisig vault on Leather with ${vault.memberCount} members.`,
    '',
    `1. Open ${inviteLink(vault)}`,
    `2. Connect this wallet: ${member.address}`,
    '3. Review the setup and tap Accept.',
    '',
    "Once you're in, the vault creator can spin up accounts inside it. Each account picks its own signing threshold, and you'll be a signer on all of them.",
  ];
  if (creatorName) lines.push('', `From ${creatorName}`);
  return lines.join('\n');
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard?.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function ShareHeader({ onClose }: { onClose?(): void }) {
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
      <styled.h2 textStyle="heading.05">Share invitations</styled.h2>
      {onClose && <IconButton icon={<CloseIcon />} onClick={onClose} />}
    </Flex>
  );
}

function CopyMessageButton({ message }: { message: string }) {
  const { success: showToast } = useToast();
  return (
    <Button
      variant="solid"
      size="sm"
      height="30px"
      px="space.03"
      textStyle="label.03"
      onClick={() => {
        void copyToClipboard(message).then(ok => {
          if (ok) showToast('Invite message copied');
        });
      }}
    >
      <Flex alignItems="center" gap="space.01">
        <CopyIcon variant="small" color="ink.background-primary" />
        Copy message
      </Flex>
    </Button>
  );
}

function PendingInviteCard({
  vault,
  member,
  creatorName,
  isExpanded,
  onToggle,
}: {
  vault: Vault;
  member: VaultMember;
  creatorName: string | null;
  isExpanded: boolean;
  onToggle(): void;
}) {
  const { success: showToast } = useToast();
  const message = inviteMessage(vault, member, creatorName);
  return (
    <Box
      borderRadius="md"
      borderWidth="1px"
      borderStyle="solid"
      borderColor="ink.border-default"
      overflow="hidden"
    >
      <Box position="relative" _hover={{ bg: 'ink.component-background-hover' }}>
        <styled.button
          type="button"
          onClick={onToggle}
          aria-label={isExpanded ? 'Collapse invite message' : 'Expand invite message'}
          position="absolute"
          inset="0"
          zIndex={0}
          bg="transparent"
          cursor="pointer"
        />
        <Flex
          alignItems="center"
          gap="space.03"
          p="space.04"
          position="relative"
          zIndex={1}
          pointerEvents="none"
        >
          <AvatarCircle name={member.name || member.address} size="md" />
          <Box flex={1} minWidth={0}>
            <Flex alignItems="center" gap="space.02">
              <styled.span textStyle="label.02">
                {member.name || truncateMiddle(member.address)}
              </styled.span>
              <Badge variant="pending" label="Invite pending" />
            </Flex>
            <styled.span display="inline-flex" pointerEvents="auto">
              <CopyAddress addr={member.address} />
            </styled.span>
          </Box>
          <Flex alignItems="center" gap="space.03" flexShrink={0}>
            <styled.span pointerEvents="auto">
              <CopyMessageButton message={message} />
            </styled.span>
            <Box
              display="flex"
              transform={isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'}
              transition="transform 150ms ease"
            >
              <ChevronDownIcon variant="small" color="ink.text-subdued" />
            </Box>
          </Flex>
        </Flex>
      </Box>

      {isExpanded && (
        <Box p="space.04" bg="ink.background-secondary">
          <styled.textarea
            readOnly
            value={message}
            rows={10}
            width="100%"
            p="space.04"
            borderRadius="sm"
            borderWidth="1px"
            borderStyle="solid"
            borderColor="ink.border-default"
            bg="ink.background-primary"
            textStyle="body.02"
            color="ink.text-primary"
            resize="vertical"
            _focusVisible={{ outline: 'none', borderColor: 'ink.action-primary-default' }}
          />
          <Flex justifyContent="flex-end" gap="space.03" mt="space.03">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void copyToClipboard(inviteLink(vault)).then(ok => {
                  if (ok) showToast('Invite link copied');
                });
              }}
            >
              <Flex alignItems="center" gap="space.02">
                <CopyIcon variant="small" />
                Copy link only
              </Flex>
            </Button>
            <CopyMessageButton message={message} />
          </Flex>
        </Box>
      )}
    </Box>
  );
}

export function ShareInvitationsModal({
  vault,
  currentUserAddress,
  isShowing,
  onClose,
}: ShareInvitationsModalProps) {
  const pending = vault.members.filter(member => member.membershipStatus === 'invited');
  const joined = vault.members.filter(member => member.membershipStatus === 'joined');
  const creator = vault.members.find(member => member.user?.id === vault.createdBy);
  const creatorName = creator?.name ?? null;
  const [expandedId, setExpandedId] = useState<string | null>(pending[0]?.membershipId ?? null);

  return (
    <Sheet
      isShowing={isShowing}
      onClose={onClose}
      contentMaxVh={90}
      maxWidth="680px"
      header={<ShareHeader />}
    >
      <Flex direction="column" gap="space.04" px="space.05" pb="space.05">
        {pending.map(member => (
          <PendingInviteCard
            key={member.membershipId}
            vault={vault}
            member={member}
            creatorName={creatorName}
            isExpanded={expandedId === member.membershipId}
            onToggle={() =>
              setExpandedId(current =>
                current === member.membershipId ? null : member.membershipId
              )
            }
          />
        ))}

        {joined.length > 0 && (
          <Box mt="space.02">
            <styled.div textStyle="caption.01" color="ink.text-subdued" mb="space.02">
              Already joined · {joined.length}
            </styled.div>
            <Flex flexWrap="wrap" gap="space.02">
              {joined.map(member => {
                const isMe = member.address === currentUserAddress;
                const label = isMe ? 'Me (you)' : member.name || truncateMiddle(member.address);
                return (
                  <Flex
                    key={member.membershipId}
                    alignItems="center"
                    gap="space.02"
                    pl="space.01"
                    pr="space.03"
                    py="space.01"
                    borderRadius="round"
                    borderWidth="1px"
                    borderStyle="solid"
                    borderColor="green.border"
                    bg="green.background-primary"
                  >
                    <AvatarCircle name={label} size="xs" />
                    <styled.span textStyle="label.03">{label}</styled.span>
                  </Flex>
                );
              })}
            </Flex>
          </Box>
        )}
      </Flex>
    </Sheet>
  );
}
