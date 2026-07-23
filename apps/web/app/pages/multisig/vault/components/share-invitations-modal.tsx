import { Box, Flex, styled } from 'leather-styles/jsx';
import { useToast } from '~/features/toasts/use-toast';

import type { Vault, VaultMember } from '@leather.io/models';
import {
  BasicTooltip,
  Button,
  CloseIcon,
  CopyIcon,
  IconButton,
  ListItemBox,
  Sheet,
  useClipboard,
} from '@leather.io/ui';
import { truncateMiddle } from '@leather.io/utils';

import { AvatarCircle } from '../../components/avatar-circle';
import { CopyAddress } from '../../components/copy-address';
import { chainFromNetwork } from '../../multisig.utils';

interface ShareInvitationsModalProps {
  vault: Vault;
  currentUserAddress?: string;
  isShowing: boolean;
  onClose(): void;
}

function inviteLink(vault: Vault): string {
  return `https://leather.io/multisig?invite=${encodeURIComponent(vault.id)}`;
}

function inviteMessage(vault: Vault, member: VaultMember, creatorName: string | null): string {
  const chainLabel = chainFromNetwork(vault.network) === 'btc' ? 'Bitcoin' : 'Stacks';
  const name = member.name || 'there';
  const lines = [
    `Hey ${name},`,
    '',
    `You're invited to "${vault.name}", a ${chainLabel} multisig vault on Leather with ${vault.members.length} members.`,
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

// Chain-link glyph for the Copy link action, distinguishing it from the copy
// glyph on Copy message. Inherits the button's text color via currentColor.
function LinkIcon() {
  return (
    <styled.svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      flexShrink={0}
      aria-hidden="true"
    >
      <path
        d="M6.7 9.3 9.3 6.7M7.3 4.7l1-1a2.36 2.36 0 0 1 3.34 0l.66.66a2.36 2.36 0 0 1 0 3.34l-1 1M8.7 11.3l-1 1a2.36 2.36 0 0 1-3.34 0l-.66-.66a2.36 2.36 0 0 1 0-3.34l1-1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </styled.svg>
  );
}

function PendingStatus() {
  return (
    <Flex alignItems="center" gap="space.02" flexShrink={0}>
      <Box width="6px" height="6px" borderRadius="round" bg="orange.action-primary-default" />
      <styled.span textStyle="caption.01" color="ink.text-subdued">
        Pending
      </styled.span>
    </Flex>
  );
}

function CopyMessageButton({ message }: { message: string }) {
  const { success: showToast } = useToast();
  const { onCopy } = useClipboard(message);
  return (
    <BasicTooltip
      asChild
      label="Includes a personal message, instructions and the vault link for that member"
    >
      <styled.span display="inline-flex" flexShrink={0}>
        <Button
          variant="outline"
          size="sm"
          height="30px"
          px="space.03"
          textStyle="label.03"
          onClick={() => {
            onCopy();
            showToast('Invite message copied');
          }}
        >
          <Flex alignItems="center" gap="space.01">
            <CopyIcon variant="small" />
            Copy message
          </Flex>
        </Button>
      </styled.span>
    </BasicTooltip>
  );
}

function CopyLinkButton({ link }: { link: string }) {
  const { success: showToast } = useToast();
  const { onCopy } = useClipboard(link);
  return (
    <Button
      variant="solid"
      size="sm"
      height="30px"
      px="space.03"
      textStyle="label.03"
      flexShrink={0}
      onClick={() => {
        onCopy();
        showToast('Invite link copied');
      }}
    >
      <Flex alignItems="center" gap="space.01" color="ink.background-primary">
        <LinkIcon />
        Copy link
      </Flex>
    </Button>
  );
}

// A pending invitee, rendered with the same member-row layout used elsewhere
// (avatar + name + adaptive address). Each row carries its own share actions;
// the invite message is copied directly — no expand step.
function PendingInviteRow({
  vault,
  member,
  creatorName,
  showDivider,
}: {
  vault: Vault;
  member: VaultMember;
  creatorName: string | null;
  showDivider: boolean;
}) {
  return (
    <Box
      px="space.04"
      py="space.03"
      borderTopWidth={showDivider ? '1px' : '0'}
      borderTopStyle="solid"
      borderTopColor="ink.border-transparent"
    >
      <ListItemBox
        variant="plain"
        leading={<AvatarCircle name={member.name || member.address} size="md" />}
        title={
          <styled.span textStyle="label.02">
            {member.name || truncateMiddle(member.address)}
          </styled.span>
        }
        titleAccessory={<PendingStatus />}
        caption={<CopyAddress addr={member.address} wide />}
        action={
          <Flex alignItems="center" gap="space.02" flexShrink={0}>
            <CopyMessageButton message={inviteMessage(vault, member, creatorName)} />
            <CopyLinkButton link={inviteLink(vault)} />
          </Flex>
        }
      />
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

  return (
    <Sheet
      isShowing={isShowing}
      onClose={onClose}
      contentMaxVh={90}
      maxWidth="680px"
      header={<ShareHeader />}
    >
      <Flex direction="column" gap="space.05" px="space.05" pb="space.05">
        {pending.length > 0 && (
          <Box
            borderRadius="md"
            borderWidth="1px"
            borderStyle="solid"
            borderColor="ink.border-default"
            overflow="hidden"
          >
            {pending.map((member, index) => (
              <PendingInviteRow
                key={member.membershipId}
                vault={vault}
                member={member}
                creatorName={creatorName}
                showDivider={index > 0}
              />
            ))}
          </Box>
        )}

        {joined.length > 0 && (
          <Box>
            <styled.div textStyle="label.03" color="ink.text-subdued" mb="space.02">
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
