import { useState } from 'react';
import { useNavigate } from 'react-router';

import { Box, Flex, styled } from 'leather-styles/jsx';
import { useMultisigMe } from '~/features/multisig/vaults/use-multisig-me';
import { useCreateVault } from '~/features/multisig/vaults/use-vault-mutations';
import { Page } from '~/layouts/page/page';

import type { AuthNetworkId } from '@leather.io/models';

import { useMultisigToast } from '../components/multisig-toast';
import { TextField } from '../components/text-field';
import type { Chain } from '../data/multisig-types';
import { multisigPaths } from '../multisig.constants';
import { ChainPicker } from './components/chain-picker';
import { type MemberDraft, MemberRows } from './components/member-rows';
import { ThemePicker } from './components/theme-picker';
import { VaultPreviewCard } from './components/vault-preview-card';

function networkForChain(chain: Chain): AuthNetworkId {
  return chain === 'btc' ? 'btc:mainnet' : 'stx:mainnet';
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box mb="space.06">
      <styled.div textStyle="label.02" color="ink.text-subdued" mb="space.03">
        {label}
      </styled.div>
      {children}
    </Box>
  );
}

const initialMembers: MemberDraft[] = [
  { addr: '', name: 'Me', isMe: true },
  { addr: '', name: '' },
  { addr: '', name: '' },
];

export function CreateVaultPage() {
  const navigate = useNavigate();
  const { showToast } = useMultisigToast();
  const [chain, setChain] = useState<Chain>('stx');
  const [name, setName] = useState('');
  const [themeId, setThemeId] = useState(0);
  const [members, setMembers] = useState<MemberDraft[]>(initialMembers);
  const [attempted, setAttempted] = useState(false);

  const network = networkForChain(chain);
  const me = useMultisigMe(network);
  const createVault = useCreateVault(network);

  const inviteeAddresses = members
    .filter(member => !member.isMe && member.addr.trim() !== '')
    .map(member => member.addr.trim());

  function validationError(): string | null {
    if (name.trim() === '') return 'Give your vault a name to continue.';
    if (inviteeAddresses.length < 2) return 'Add at least 2 members to continue.';
    return null;
  }

  function backendError(): string | null {
    return createVault.error ? createVault.error.message : null;
  }

  const error = attempted ? (validationError() ?? backendError()) : null;

  function submit() {
    setAttempted(true);
    if (validationError()) return;
    createVault.mutate(
      { name: name.trim(), members: inviteeAddresses },
      {
        onSuccess(vault) {
          showToast(`Vault “${vault.name}” created`);
          void navigate(multisigPaths.vault(vault.id));
        },
      }
    );
  }

  return (
    <Page>
      <Page.Header title="Create vault" backTo={multisigPaths.index} />
      <Flex
        direction={['column', 'column', 'row']}
        gap="space.07"
        alignItems="flex-start"
        mt="space.07"
      >
        <Box flex={['1', '1', '1.4']} width="100%">
          <Section label="Vault name">
            <TextField placeholder="e.g. Team treasury" value={name} onChange={setName} />
          </Section>
          <Section label="Chain">
            <ChainPicker chain={chain} onChange={setChain} />
          </Section>
          <Section label="Theme">
            <ThemePicker themeId={themeId} onChange={setThemeId} />
          </Section>
          <Section label="Members">
            <MemberRows
              chain={chain}
              members={members}
              onChange={setMembers}
              myAddress={me.data?.address}
            />
          </Section>
        </Box>
        <Box
          flex={['1', '1', '1']}
          width="100%"
          position={['static', 'static', 'sticky']}
          top="space.05"
        >
          <VaultPreviewCard
            chain={chain}
            name={name}
            themeId={themeId}
            members={members}
            error={error}
            onSubmit={submit}
          />
        </Box>
      </Flex>
    </Page>
  );
}
