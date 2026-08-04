import { Box, Flex, styled } from 'leather-styles/jsx';
import { CopyAddress } from '~/components/copy-address';

import { Button, ListItemBox } from '@leather.io/ui';

import { AvatarCircle } from '../../components/avatar-circle';
import { AvatarSq } from '../../components/avatar-sq';
import { ChainAvatar } from '../../components/chain-avatar';
import type { Chain } from '../../data/multisig-types';
import { vaultTheme } from '../../multisig-tokens';
import type { MemberDraft } from './member-rows';

interface VaultPreviewCardProps {
  chain: Chain;
  name: string;
  themeId: number;
  members: MemberDraft[];
  myAddress?: string;
  error?: string | null;
  disabled?: boolean;
  onSubmit(): void;
}

function PreviewSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box
      p="space.04"
      borderTopWidth="1px"
      borderTopStyle="solid"
      borderTopColor="ink.border-transparent"
    >
      <styled.div textStyle="label.03" color="ink.text-subdued" mb="space.02">
        {label}
      </styled.div>
      {children}
    </Box>
  );
}

export function VaultPreviewCard({
  chain,
  name,
  themeId,
  members,
  myAddress,
  error,
  disabled,
  onSubmit,
}: VaultPreviewCardProps) {
  const theme = vaultTheme(themeId);
  const chainLabel = chain === 'btc' ? 'Bitcoin' : 'Stacks';
  const filled = members
    .map(member => (member.isMe ? { ...member, addr: myAddress ?? '' } : member))
    .filter(member => member.addr.trim() !== '');

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
        <AvatarSq chain={chain} icon="vault" themeId={themeId} size="lg" />
        <styled.div textStyle="heading.05">{name || 'Vault name'}</styled.div>
      </Flex>

      <PreviewSection label="Chain">
        <ListItemBox
          variant="plain"
          density="compact"
          leading={<ChainAvatar chain={chain} size="md" />}
          title={<styled.span textStyle="label.03">{chainLabel}</styled.span>}
        />
      </PreviewSection>

      <PreviewSection label={`Members (${filled.length})`}>
        {filled.length === 0 ? (
          <Flex
            direction="column"
            alignItems="center"
            textAlign="center"
            gap="space.01"
            py="space.04"
          >
            <AvatarCircle name="" size="md" />
            <styled.span textStyle="caption.01" color="ink.text-subdued">
              Members you add will appear here.
            </styled.span>
          </Flex>
        ) : (
          <Flex direction="column" gap="space.03">
            {filled.map(member => (
              <ListItemBox
                key={member.id}
                variant="plain"
                density="compact"
                leading={<AvatarCircle name={member.name} size="md" />}
                title={
                  <styled.span textStyle="label.03">
                    {member.name || '—'}
                    {member.isMe ? ' (me)' : ''}
                  </styled.span>
                }
                caption={<CopyAddress addr={member.addr} />}
              />
            ))}
          </Flex>
        )}
      </PreviewSection>

      <PreviewSection label="Good to know">
        <styled.p textStyle="body.02" color="ink.text-primary">
          No threshold to pick yet. You&rsquo;ll set one later, for each account you create in this
          vault.
        </styled.p>
      </PreviewSection>

      {disabled && (
        <Box
          px="space.04"
          py="space.03"
          borderTopWidth="1px"
          borderTopStyle="solid"
          borderTopColor="ink.border-transparent"
          bg="ink.background-secondary"
        >
          <styled.span textStyle="caption.01" color="ink.text-subdued">
            Connect your {chainLabel} wallet above to enable Create vault.
          </styled.span>
        </Box>
      )}

      <Box
        p="space.04"
        borderTopWidth="1px"
        borderTopStyle="solid"
        borderTopColor="ink.border-transparent"
      >
        {error && (
          <styled.div textStyle="caption.01" color="red.action-primary-default" mb="space.03">
            {error}
          </styled.div>
        )}
        <Button variant="solid" size="md" fullWidth disabled={disabled} onClick={onSubmit}>
          Create vault
        </Button>
      </Box>
    </Box>
  );
}
