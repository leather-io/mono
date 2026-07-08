import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { Box, Flex, styled } from 'leather-styles/jsx';
import { useMultisigNetworks } from '~/features/multisig/auth/use-multisig-networks';
import { useSession } from '~/features/multisig/auth/use-session';
import { useSignIn } from '~/features/multisig/auth/use-sign-in';
import { normalizeNativeSegwitAddress } from '~/features/multisig/network/normalize-btc-address';
import { resolveBtcNetworkMode } from '~/features/multisig/network/resolve-btc-network-mode';
import { useCreateVault } from '~/features/multisig/vaults/use-vault-mutations';
import { useToast } from '~/features/toasts/use-toast';
import { useAddressBnsName, useBnsNames, useBnsPrimaryNames } from '~/queries/bns/bns.query';

import { isValidBitcoinNetworkAddress } from '@leather.io/bitcoin';
import type { BitcoinNetworkModes } from '@leather.io/models';
import { LeatherApiError } from '@leather.io/services';
import { isValidStacksAddress } from '@leather.io/stacks';
import { Button, InfoCircleIcon, useDebouncedValue } from '@leather.io/ui';

import { MultisigPage } from '../components/multisig-page';
import { TextField } from '../components/text-field';
import type { Chain } from '../data/multisig-types';
import { vaultThemeName } from '../multisig-tokens';
import { multisigPaths } from '../multisig.constants';
import { ChainPicker } from './components/chain-picker';
import { type MemberDraft, type MemberFieldStatus, MemberRows } from './components/member-rows';
import { ThemePicker } from './components/theme-picker';
import { VaultPreviewCard } from './components/vault-preview-card';
import { looksLikeBnsName, reconcileMemberBns } from './member-bns';

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

  const bnsEnabled = chain === 'stx' && networkMode === 'mainnet';
  const bnsCandidates = bnsEnabled
    ? members.flatMap(member => {
        if (member.isMe) return [];
        const candidates: string[] = [];
        if (looksLikeBnsName(member.addr)) candidates.push(member.addr.trim());
        if (looksLikeBnsName(member.name)) candidates.push(member.name.trim());
        return candidates;
      })
    : [];
  // Debounced so a name resolving mid-type doesn't fire a lookup on every keystroke.
  const debouncedCandidateKey = useDebouncedValue(bnsCandidates.join('|'), 300);
  const bnsResolutions = useBnsNames(debouncedCandidateKey ? debouncedCandidateKey.split('|') : []);
  const reconciledMembers = members.map(member =>
    bnsEnabled && !member.isMe
      ? reconcileMemberBns(member, candidate => bnsResolutions.get(candidate.trim()))
      : { addr: member.addr, name: member.name, bns: 'none' as const }
  );

  useEffect(() => {
    if (!bnsEnabled) return;
    let changed = false;
    const next = members.map(member => {
      if (member.isMe) return member;
      const reconciled = reconcileMemberBns(member, candidate =>
        bnsResolutions.get(candidate.trim())
      );
      if (reconciled.addr !== member.addr || reconciled.name !== member.name) {
        changed = true;
        return { ...member, addr: reconciled.addr, name: reconciled.name };
      }
      return member;
    });
    if (changed) setMembers(next);
  }, [bnsEnabled, members, bnsResolutions]);

  // A member entered by address gets their own BNS name auto-filled as the label,
  // once per address and only while the name is empty, so it stays editable.
  const memberAddresses = bnsEnabled
    ? members
        .filter(member => !member.isMe && isValidMemberAddress(member.addr.trim()))
        .map(member => member.addr.trim())
    : [];
  const reverseBnsNames = useBnsPrimaryNames(memberAddresses);
  const filledMemberNames = useRef<Record<string, string>>({});
  useEffect(() => {
    if (!bnsEnabled) return;
    let changed = false;
    const next = members.map(member => {
      const addr = member.addr.trim();
      if (member.isMe || member.name.trim() !== '') return member;
      if (filledMemberNames.current[member.id] === addr) return member;
      const name = reverseBnsNames.get(addr);
      if (!name) return member;
      filledMemberNames.current[member.id] = addr;
      changed = true;
      return { ...member, name };
    });
    if (changed) setMembers(next);
  }, [bnsEnabled, members, reverseBnsNames]);

  // Pre-label the signed-in user with their own BNS name, once, and only while
  // they haven't typed a name of their own.
  const myBnsName = useAddressBnsName(myAddress, bnsEnabled);
  const didPrefillMyName = useRef(false);
  useEffect(() => {
    if (didPrefillMyName.current || !myBnsName) return;
    const me = members.find(member => member.isMe);
    if (!me || me.name.trim() !== '') return;
    didPrefillMyName.current = true;
    setMembers(current =>
      current.map(member => (member.isMe ? { ...member, name: myBnsName } : member))
    );
  }, [myBnsName, members]);

  const meName = members.find(member => member.isMe)?.name.trim();
  const memberPayload: { address: string; name?: string }[] = [
    ...(myAddress ? [{ address: normalizeAddress(myAddress), name: meName || undefined }] : []),
    ...reconciledMembers
      .filter((reconciled, index) => !members[index].isMe && reconciled.addr.trim() !== '')
      .map(reconciled => ({
        address: normalizeAddress(reconciled.addr.trim()),
        name: reconciled.name.trim() || undefined,
      })),
  ];

  function getMemberStatus(member: MemberDraft, index: number): MemberFieldStatus {
    if (member.isMe) return { state: 'empty' };
    const reconciled = reconciledMembers[index];
    if (reconciled.bns === 'resolving') return { state: 'resolving' };
    if (reconciled.bns === 'not-found') return { state: 'invalid', error: 'Not a valid BNS name.' };
    if (reconciled.bns === 'mismatch')
      return { state: 'invalid', error: 'BNS name does not match address.' };
    const raw = reconciled.addr.trim();
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
      reconciledMembers.some(
        (other, i) =>
          i !== index && !members[i].isMe && normalizeAddress(other.addr.trim()) === address
      )
    )
      return { state: 'invalid', error: 'This address is already added.' };
    return { state: 'valid' };
  }

  const memberStatuses = members.map(getMemberStatus);
  const hasInvalidMember = memberStatuses.some(status => status.state === 'invalid');
  const hasResolvingMember = memberStatuses.some(status => status.state === 'resolving');

  function validationError(): string | null {
    if (!connected[chain]) return `Connect your ${chainLabel} wallet to continue.`;
    if (name.trim() === '') return 'Give your vault a name to continue.';
    if (memberPayload.length < 2) return 'Add at least one other member to continue.';
    if (hasResolvingMember) return 'Waiting for BNS names to resolve…';
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
              allowBnsName={bnsEnabled}
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
