import { useState } from 'react';
import { useNavigate } from 'react-router';

import { Box, Flex, styled } from 'leather-styles/jsx';
import { Page } from '~/layouts/page/page';

import { useMultisigToast } from '../components/multisig-toast';
import { TextField } from '../components/text-field';
import { myWalletAddress } from '../data/dummy-multisig-data';
import type { Chain } from '../data/multisig-types';
import { multisigPaths } from '../multisig.constants';
import { useMultisigActions } from '../store/use-multisig';
import { ChainPicker } from './components/chain-picker';
import { type MemberDraft, MemberRows } from './components/member-rows';
import { ThemePicker } from './components/theme-picker';
import { VaultPreviewCard } from './components/vault-preview-card';

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

// Create Vault is a single full-screen sectioned form (not a stepper). Submit-
// on-click validation: the button is always enabled; clicking with an invalid
// name surfaces the error in the preview card.
export function CreateVaultPage() {
  const navigate = useNavigate();
  const { addVault } = useMultisigActions();
  const { showToast } = useMultisigToast();
  const [chain, setChain] = useState<Chain>('stx');
  const [name, setName] = useState('');
  const [themeId, setThemeId] = useState(0);
  const [members, setMembers] = useState<MemberDraft[]>(initialMembers);
  const [attempted, setAttempted] = useState(false);

  const error = attempted && name.trim() === '' ? 'Give your vault a name to continue.' : null;

  function submit() {
    setAttempted(true);
    if (name.trim() === '') return;
    const filled = members
      .map(m => (m.isMe ? { ...m, addr: myWalletAddress[chain] } : m))
      .filter(m => m.isMe || m.addr.trim() !== '');
    addVault({ chain, name: name.trim(), theme: themeId, members: filled });
    showToast(`Vault “${name.trim()}” created`);
    void navigate(multisigPaths.index);
  }

  return (
    <Page>
      <Page.Header title="Create vault" backTo={multisigPaths.index} />
      <Flex direction={['column', 'column', 'row']} gap="space.07" alignItems="flex-start">
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
            <MemberRows chain={chain} members={members} onChange={setMembers} />
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
