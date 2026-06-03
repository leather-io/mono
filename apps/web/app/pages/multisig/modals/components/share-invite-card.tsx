import { Box, Flex, styled } from 'leather-styles/jsx';

import { AvatarCircle } from '../../components/avatar-circle';
import { CopyAddress } from '../../components/copy-address';
import { VaultListItem } from '../../components/vault-list-item';
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
      <Box mb="space.04">
        <VaultListItem
          leading={<AvatarCircle name={member.name} size="lg" />}
          title={member.name}
          caption={member.handle}
        />
      </Box>
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
