import { useState } from 'react';
import { useNavigate } from 'react-router';

import { Box, Flex, styled } from 'leather-styles/jsx';
import { useSession } from '~/features/multisig/auth/use-session';
import { useSignIn } from '~/features/multisig/auth/use-sign-in';
import { useCreateVault } from '~/features/multisig/vaults/use-vault-mutations';
import { useToast } from '~/features/toasts/use-toast';
import { Page } from '~/layouts/page/page';

import { isValidBitcoinAddress } from '@leather.io/bitcoin';
import type { AuthNetworkId } from '@leather.io/models';
import { LeatherApiError } from '@leather.io/services';
import { isValidStacksAddress } from '@leather.io/stacks';
import { Button, InfoCircleIcon } from '@leather.io/ui';

import { TextField } from '../components/text-field';
import type { Chain } from '../data/multisig-types';
import { multisigPaths } from '../multisig.constants';
import { ChainPicker } from './components/chain-picker';
import { type MemberDraft, type MemberFieldStatus, MemberRows } from './components/member-rows';
import { ThemePicker } from './components/theme-picker';
import { VaultPreviewCard } from './components/vault-preview-card';

function networkForChain(chain: Chain): AuthNetworkId {
  return chain === 'btc' ? 'btc:mainnet' : 'stx:mainnet';
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box mb="space.06">
      <styled.div textStyle="label.01" color="ink.text-primary" mb="space.03">
        {label}
      </styled.div>
      {children}
    </Box>
  );
}

const initialMembers: MemberDraft[] = [
  { id: 'me', addr: '', name: '', isMe: true },
  { id: 'member-1', addr: '', name: '' },
  { id: 'member-2', addr: '', name: '' },
];

function ConnectChainCallout({
  chainLabel,
  isPending,
  onConnect,
}: {
  chainLabel: string;
  isPending: boolean;
  onConnect(): void;
}) {
  return (
    <Flex
      gap="space.04"
      alignItems="center"
      p="space.04"
      borderRadius="md"
      borderWidth="1px"
      borderStyle="solid"
      borderColor="yellow.border"
      bg="yellow.background-primary"
    >
      <Box flexShrink={0} color="ink.text-primary">
        <InfoCircleIcon variant="small" />
      </Box>
      <Box flex={1} minWidth={0}>
        <styled.p textStyle="label.02">Connect your {chainLabel} wallet to continue</styled.p>
        <styled.p textStyle="caption.01" color="ink.text-subdued" mt="space.01">
          Leather needs your {chainLabel} key to add you as the first signer.
        </styled.p>
      </Box>
      <Button
        variant="solid"
        size="sm"
        disabled={isPending}
        aria-busy={isPending}
        onClick={onConnect}
      >
        Connect {chainLabel}
      </Button>
    </Flex>
  );
}

export function CreateVaultPage() {
  const navigate = useNavigate();
  const { success: showToast } = useToast();
  const [chain, setChain] = useState<Chain>('stx');
  const [name, setName] = useState('');
  const [themeId, setThemeId] = useState(0);
  const [members, setMembers] = useState<MemberDraft[]>(initialMembers);
  const [attempted, setAttempted] = useState(false);

  const network = networkForChain(chain);
  const createVault = useCreateVault(network);
  const signIn = useSignIn(network);

  const btcSession = useSession('btc:mainnet');
  const stxSession = useSession('stx:mainnet');
  const connected: Record<Chain, boolean> = {
    btc: Boolean(btcSession),
    stx: Boolean(stxSession),
  };
  const myAddress = (chain === 'btc' ? btcSession : stxSession)?.identity.address;
  const chainLabel = chain === 'btc' ? 'Bitcoin' : 'Stacks';

  function isValidMemberAddress(address: string) {
    return chain === 'btc'
      ? isValidBitcoinAddress(address) && address.toLowerCase().startsWith('bc1q')
      : isValidStacksAddress(address) && (address.startsWith('SP') || address.startsWith('SM'));
  }

  function normalizeAddress(value: string) {
    return chain === 'btc' ? value.toLowerCase() : value;
  }

  const inviteeAddresses = members
    .filter(member => !member.isMe && member.addr.trim() !== '')
    .map(member => normalizeAddress(member.addr.trim()));

  const memberAddresses = myAddress
    ? [normalizeAddress(myAddress), ...inviteeAddresses]
    : inviteeAddresses;

  function getMemberStatus(member: MemberDraft, index: number): MemberFieldStatus {
    if (member.isMe) return { state: 'empty' };
    const address = member.addr.trim();
    if (address === '') return { state: 'empty' };
    if (!isValidMemberAddress(address))
      return {
        state: 'invalid',
        error:
          chain === 'btc'
            ? 'Enter a native SegWit address (bc1q…). Taproot is not supported.'
            : 'Enter a Stacks mainnet address (SP…).',
      };
    const normalized = normalizeAddress(address);
    if (myAddress && normalizeAddress(myAddress) === normalized)
      return {
        state: 'invalid',
        error: "You're added automatically — enter another member's address.",
      };
    if (
      members.some(
        (other, i) =>
          i !== index && !other.isMe && normalizeAddress(other.addr.trim()) === normalized
      )
    )
      return { state: 'invalid', error: 'This address is already added.' };
    return { state: 'valid' };
  }

  const memberStatuses = members.map(getMemberStatus);
  const hasInvalidMember = memberStatuses.some(status => status.state === 'invalid');

  function validationError(): string | null {
    if (name.trim() === '') return 'Give your vault a name to continue.';
    if (memberAddresses.length < 2) return 'Add at least one other member to continue.';
    if (hasInvalidMember) return 'Fix the highlighted member addresses.';
    return null;
  }

  function backendError(): string | null {
    const error = createVault.error;
    if (!error) return null;
    if (LeatherApiError.isLeatherApiError(error) && error.status === 409) {
      return 'A vault with this exact set of members already exists on this network. Add or remove a member to create a separate vault.';
    }
    return error.message;
  }

  const error = attempted ? (validationError() ?? backendError()) : null;

  function clearError() {
    setAttempted(false);
    createVault.reset();
  }

  function submit() {
    setAttempted(true);
    if (!connected[chain] || createVault.isPending || validationError()) return;
    // TODO: send the picked themeId once the multisig service persists vault
    // theme — until then the choice is preview-only and displayed vaults use
    // fallbackVaultThemeId.
    createVault.mutate(
      { name: name.trim(), members: memberAddresses },
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
            <TextField
              placeholder="e.g. Team treasury"
              value={name}
              invalid={attempted && name.trim() === ''}
              onChange={value => {
                setName(value);
                clearError();
              }}
            />
          </Section>
          <Section label="Chain">
            <ChainPicker
              chain={chain}
              connected={connected}
              onChange={value => {
                setChain(value);
                clearError();
              }}
            />
            {!connected[chain] && (
              <Box mt="space.04">
                <ConnectChainCallout
                  chainLabel={chainLabel}
                  isPending={signIn.isPending}
                  onConnect={() => signIn.mutate()}
                />
              </Box>
            )}
          </Section>
          <Section label="Theme">
            <ThemePicker
              themeId={themeId}
              onChange={value => {
                setThemeId(value);
                clearError();
              }}
            />
          </Section>
          <Section label="Members">
            <MemberRows
              chain={chain}
              members={members}
              onChange={value => {
                setMembers(value);
                clearError();
              }}
              myAddress={myAddress}
              statuses={memberStatuses}
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
            myAddress={myAddress}
            error={error}
            disabled={!connected[chain] || createVault.isPending}
            onSubmit={submit}
          />
        </Box>
      </Flex>
    </Page>
  );
}
