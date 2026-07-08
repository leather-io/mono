import { useState } from 'react';
import { useNavigate } from 'react-router';

import { Box, Flex, styled } from 'leather-styles/jsx';
import { useMultisigNetworks } from '~/features/multisig/auth/use-multisig-networks';
import { useSession } from '~/features/multisig/auth/use-session';
import { useSignIn } from '~/features/multisig/auth/use-sign-in';
import { normalizeNativeSegwitAddress } from '~/features/multisig/network/normalize-btc-address';
import { resolveBtcNetworkMode } from '~/features/multisig/network/resolve-btc-network-mode';
import { useCreateVault } from '~/features/multisig/vaults/use-vault-mutations';
import { useToast } from '~/features/toasts/use-toast';

import { isValidBitcoinNetworkAddress } from '@leather.io/bitcoin';
import type { BitcoinNetworkModes } from '@leather.io/models';
import { LeatherApiError } from '@leather.io/services';
import { isValidStacksAddress } from '@leather.io/stacks';
import { Button, InfoCircleIcon } from '@leather.io/ui';

import { MultisigPage } from '../components/multisig-page';
import { TextField } from '../components/text-field';
import type { Chain } from '../data/multisig-types';
import { vaultThemeName } from '../multisig-tokens';
import { multisigPaths } from '../multisig.constants';
import { ChainPicker } from './components/chain-picker';
import { type MemberDraft, type MemberFieldStatus, MemberRows } from './components/member-rows';
import { ThemePicker } from './components/theme-picker';
import { VaultPreviewCard } from './components/vault-preview-card';

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

function btcSegwitPrefixForMode(mode: BitcoinNetworkModes): string {
  if (mode === 'mainnet') return 'bc1q';
  if (mode === 'regtest') return 'bcrt1q';
  return 'tb1q';
}

function btcMemberAddressError(address: string, expectedPrefix: string): string {
  const lower = address.toLowerCase();
  const isTaproot =
    lower.startsWith('bc1p') || lower.startsWith('tb1p') || lower.startsWith('bcrt1p');
  return isTaproot
    ? `Taproot addresses aren't supported. Enter a native SegWit address (${expectedPrefix}…).`
    : `Enter a native SegWit address for this network (${expectedPrefix}…).`;
}

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

  const { btc: btcNetwork, stx: stxNetwork } = useMultisigNetworks();
  const network = chain === 'btc' ? btcNetwork : stxNetwork;
  const createVault = useCreateVault(network);
  const signIn = useSignIn(network);

  const btcSession = useSession(btcNetwork);
  const stxSession = useSession(stxNetwork);
  const connected: Record<Chain, boolean> = {
    btc: Boolean(btcSession),
    stx: Boolean(stxSession),
  };
  const myAddress = (chain === 'btc' ? btcSession : stxSession)?.identity.address;
  const chainLabel = chain === 'btc' ? 'Bitcoin' : 'Stacks';

  const networkMode = network.endsWith('mainnet') ? 'mainnet' : 'testnet';
  const btcNetworkMode = resolveBtcNetworkMode(network);
  const btcNativeSegwitPrefix = btcSegwitPrefixForMode(btcNetworkMode);
  const stxPrefixes = networkMode === 'mainnet' ? ['SP', 'SM'] : ['ST', 'SN'];

  function isValidMemberAddress(address: string) {
    return chain === 'btc'
      ? isValidBitcoinNetworkAddress(address, btcNetworkMode) &&
          address.toLowerCase().startsWith(btcNativeSegwitPrefix)
      : isValidStacksAddress(address) && stxPrefixes.some(prefix => address.startsWith(prefix));
  }

  function normalizeAddress(value: string) {
    return chain === 'btc'
      ? normalizeNativeSegwitAddress(value.toLowerCase(), btcNetworkMode)
      : value;
  }

  const meName = members.find(member => member.isMe)?.name.trim();
  const memberPayload: { address: string; name?: string }[] = [
    ...(myAddress ? [{ address: normalizeAddress(myAddress), name: meName || undefined }] : []),
    ...members
      .filter(member => !member.isMe && member.addr.trim() !== '')
      .map(member => ({
        address: normalizeAddress(member.addr.trim()),
        name: member.name.trim() || undefined,
      })),
  ];

  function getMemberStatus(member: MemberDraft, index: number): MemberFieldStatus {
    if (member.isMe) return { state: 'empty' };
    const raw = member.addr.trim();
    if (raw === '') return { state: 'empty' };
    const address = normalizeAddress(raw);
    if (!isValidMemberAddress(address))
      return {
        state: 'invalid',
        error:
          chain === 'btc'
            ? btcMemberAddressError(address, btcNativeSegwitPrefix)
            : `Enter a Stacks ${networkMode} address (${stxPrefixes[0]}…).`,
      };
    if (myAddress && normalizeAddress(myAddress) === address)
      return {
        state: 'invalid',
        error: "You're added automatically — enter another member's address.",
      };
    if (
      members.some(
        (other, i) => i !== index && !other.isMe && normalizeAddress(other.addr.trim()) === address
      )
    )
      return { state: 'invalid', error: 'This address is already added.' };
    return { state: 'valid' };
  }

  const memberStatuses = members.map(getMemberStatus);
  const hasInvalidMember = memberStatuses.some(status => status.state === 'invalid');

  function validationError(): string | null {
    if (!connected[chain]) return `Connect your ${chainLabel} wallet to continue.`;
    if (name.trim() === '') return 'Give your vault a name to continue.';
    if (memberPayload.length < 2) return 'Add at least one other member to continue.';
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
    createVault.mutate(
      { name: name.trim(), theme: vaultThemeName(themeId), members: memberPayload },
      {
        onSuccess(vault) {
          showToast(`Vault “${vault.name}” created`);
          void navigate(multisigPaths.vault(vault.id));
        },
      }
    );
  }

  return (
    <MultisigPage title="Create vault" backTo={multisigPaths.index}>
      <Flex
        direction={['column', 'column', 'row']}
        gap={['space.06', 'space.06', 'space.08', 'space.10']}
        alignItems="flex-start"
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
              onNormalizeAddress={normalizeAddress}
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
    </MultisigPage>
  );
}
