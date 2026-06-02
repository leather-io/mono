import { Box, Flex, styled } from 'leather-styles/jsx';

import { AvatarCircle } from '../../components/avatar-circle';
import { CopyAddress } from '../../components/copy-address';
import type { Member, Vault } from '../../data/multisig-types';
import { FauxQR } from './faux-qr';

interface ShareInviteCardProps {
  member: Member;
  vault: Vault;
}

export function ShareInviteCard({ member, vault }: ShareInviteCardProps) {
  const inviteUrl = `https://multisig.leather.io/join/${vault.inviteToken}?m=${encodeURIComponent(member.handle || member.name)}`;
  return (
    <Box
      p="space.04"
      borderRadius="md"
      borderWidth="1px"
      borderStyle="solid"
      borderColor="ink.border-default"
    >
      <Flex alignItems="center" gap="space.03" mb="space.04">
        <AvatarCircle name={member.name} size="sm" />
        <Box minWidth={0}>
          <styled.div textStyle="label.02" truncate>
            {member.name}
          </styled.div>
          {member.handle && (
            <styled.div textStyle="caption.01" color="ink.text-subdued">
              {member.handle}
            </styled.div>
          )}
        </Box>
      </Flex>
      <Flex gap="space.04" alignItems="center" flexWrap="wrap">
        <FauxQR text={inviteUrl} size={108} />
        <Box flex={1} minWidth="180px">
          <styled.div textStyle="caption.01" color="ink.text-subdued" mb="space.01">
            Invite link
          </styled.div>
          <CopyAddress addr={inviteUrl} full />
        </Box>
      </Flex>
    </Box>
  );
}
