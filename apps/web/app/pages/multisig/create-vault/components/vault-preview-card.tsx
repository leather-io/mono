import { Box, Flex, styled } from 'leather-styles/jsx';

import { Button } from '@leather.io/ui';

import { AvatarCircle } from '../../components/avatar-circle';
import { AvatarSq } from '../../components/avatar-sq';
import { ChainPill } from '../../components/chain-pill';
import { myWalletAddress } from '../../data/dummy-multisig-data';
import type { Chain } from '../../data/multisig-types';
import { vaultTheme } from '../../multisig-tokens';
import type { MemberDraft } from './member-rows';

interface VaultPreviewCardProps {
  chain: Chain;
  name: string;
  themeId: number;
  members: MemberDraft[];
  error?: string | null;
  onSubmit(): void;
}

export function VaultPreviewCard({
  chain,
  name,
  themeId,
  members,
  error,
  onSubmit,
}: VaultPreviewCardProps) {
  const theme = vaultTheme(themeId);
  const filled = members
    .map(m => (m.isMe ? { ...m, addr: myWalletAddress[chain] } : m))
    .filter(m => m.addr.trim() !== '');

  return (
    <Box
      borderRadius="lg"
      borderWidth="1px"
      borderStyle="solid"
      borderColor="ink.border-default"
      overflow="hidden"
    >
      <Flex
        direction="column"
        alignItems="center"
        gap="space.02"
        p="space.06"
        color={theme.dark ? 'white' : 'ink.text-primary'}
        style={{ background: theme.background }}
      >
        <AvatarSq chain={chain} icon="vault" themeId={themeId} size="lg" withChainBadge={false} />
        <styled.div textStyle="heading.05">{name || 'Vault name'}</styled.div>
      </Flex>

      <Box p="space.04">
        <Flex justifyContent="space-between" alignItems="center" mb="space.03">
          <styled.span textStyle="caption.01" color="ink.text-subdued">
            Chain
          </styled.span>
          <ChainPill chain={chain} />
        </Flex>
        <styled.div textStyle="caption.01" color="ink.text-subdued" mb="space.02">
          Members ({filled.length})
        </styled.div>
        <Flex direction="column" gap="space.02">
          {filled.map((member, index) => (
            <Flex key={index} alignItems="center" gap="space.02">
              <AvatarCircle name={member.name || '?'} size="xs" />
              <styled.span textStyle="caption.01">
                {member.name || '—'}
                {member.isMe ? ' (me)' : ''}
              </styled.span>
            </Flex>
          ))}
        </Flex>

        {error && (
          <styled.div textStyle="caption.01" color="red.action-primary-default" mt="space.03">
            {error}
          </styled.div>
        )}

        <Button variant="solid" fullWidth onClick={onSubmit} mt="space.04">
          Create vault
        </Button>
      </Box>
    </Box>
  );
}
