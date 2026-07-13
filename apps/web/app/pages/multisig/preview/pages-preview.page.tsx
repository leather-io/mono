import { type ReactNode, useEffect, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { Box, Flex, styled } from 'leather-styles/jsx';
import { multisigVaultKeys } from '~/features/multisig/vaults/vault-query-keys';

import type {
  AuthNetworkId,
  MultisigTransaction,
  MultisigTransactionStatus,
  Vault,
  VaultAccount,
  VaultAccountSigner,
  VaultAccountSummary,
  VaultMember,
  VaultSummary,
} from '@leather.io/models';
import { Button, ListItemBox } from '@leather.io/ui';

import { AccountDetailsCard } from '../account/components/account-details-card';
import { AvatarSq } from '../components/avatar-sq';
import { Badge } from '../components/badge';
import { InvitationModal } from '../components/invitation-modal';
import { MultisigHero } from '../components/multisig-hero';
import { SectionLabel } from '../components/section-label';
import { TransactionList, type TransactionListItem } from '../components/transaction-list';
import { ChainPicker } from '../create-vault/components/chain-picker';
import { type MemberDraft, MemberRows } from '../create-vault/components/member-rows';
import { ThemePicker } from '../create-vault/components/theme-picker';
import { VaultPreviewCard } from '../create-vault/components/vault-preview-card';
import { CreateVaultTile } from '../dashboard/components/create-vault-tile';
import { vaultThemeFromName } from '../multisig-tokens';
import { SignerRollcall } from '../tx/components/signer-rollcall';
import { TxDetailsTable } from '../tx/components/tx-details-table';
import { AccountsSection } from '../vault/components/accounts-section';
import { CancelVaultModal } from '../vault/components/cancel-vault-modal';
import { CreateAccountModal } from '../vault/components/create-account-modal';
import { MembersSection } from '../vault/components/members-section';
import { ShareInvitationsModal } from '../vault/components/share-invitations-modal';
import { VaultStatusCard } from '../vault/components/vault-status-card';

// Dev-only: every multisig page reconstructed with mock data + the real
// presentational components (stand-ins where a component self-fetches), stacked
// main + sidebar so the views can be compared and tweaked. The 3 passive modals
// are wired open via buttons; the 2 self-fetch-on-render modals are omitted.
// Strip before the PR.
const NETWORK: AuthNetworkId = 'stx:mainnet';
const ME = 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKQVX8X0G';
const ADDR_2 = 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE';
const ADDR_3 = 'SP1H1733V5MZ3SZ9XRW9FKYGEZT0JDGEB8Y634C7R';
const nowSeconds = Math.floor(Date.now() / 1000);
const orangeTheme = vaultThemeFromName('Orange').id;
const blueTheme = vaultThemeFromName('Blue').id;

const members: VaultMember[] = [
  { membershipId: 'm1', address: ME, name: 'Me', membershipStatus: 'joined', user: null },
  { membershipId: 'm2', address: ADDR_2, name: 'Amber', membershipStatus: 'joined', user: null },
  { membershipId: 'm3', address: ADDR_3, name: 'Jane', membershipStatus: 'invited', user: null },
];

const vault: Vault = {
  id: 'vault-preview',
  name: 'Team Treasury',
  theme: 'Orange',
  icon: null,
  network: NETWORK,
  status: 'active',
  createdBy: 'u0',
  createdAt: '',
  members,
};

const signers: VaultAccountSigner[] = members.map((member, index) => ({
  network: NETWORK,
  publicKey: '',
  address: member.address,
  id: `signer-${index}`,
  userId: `u${index}`,
  xpub: null,
  xpubOriginFingerprint: null,
  xpubOriginPath: null,
  signerIndex: index,
  signingPubkey: '',
}));

const account: VaultAccount = {
  id: 'account-preview',
  vaultId: vault.id,
  name: 'Operating account',
  icon: 'piggybank',
  network: NETWORK,
  threshold: 2,
  multisigAddress: 'SM2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKQABCDEFG',
  accountIndex: 0,
  createdAt: '',
  signers,
  pendingTransactionCount: 1,
  queuedTransactionCount: 0,
};

const invitedSummary: VaultSummary = {
  id: 'v2',
  name: 'Vault One',
  theme: 'Blue',
  icon: null,
  network: 'btc:mainnet',
  status: 'pending',
  createdBy: 'u0',
  createdAt: '',
  membershipStatus: 'invited',
  memberCount: 3,
  accountCount: 1,
};

const vaultSummaries: VaultSummary[] = [
  {
    id: 'v1',
    name: 'Team Treasury',
    theme: 'Orange',
    icon: null,
    network: NETWORK,
    status: 'active',
    createdBy: 'u0',
    createdAt: '',
    membershipStatus: 'joined',
    memberCount: 3,
    accountCount: 2,
  },
  invitedSummary,
];

// AccountsSection takes accounts as a prop (it only self-fetches each row's
// balance, which stays blank here — like the hero).
const mockAccountSummaries: VaultAccountSummary[] = [
  {
    id: 'account-preview',
    vaultId: vault.id,
    name: 'Operating account',
    icon: 'piggybank',
    network: NETWORK,
    threshold: 2,
    multisigAddress: account.multisigAddress,
    accountIndex: 0,
    createdAt: '',
    signerCount: 3,
  },
  {
    id: 'account-2',
    vaultId: vault.id,
    name: 'Treasury reserve',
    icon: 'vault',
    network: NETWORK,
    threshold: 3,
    multisigAddress: 'SM31FCABZP9D2GVQYZP8GD4PRKR0WG5NQNDKAPQVT',
    accountIndex: 1,
    createdAt: '',
    signerCount: 3,
  },
];

// useVault(network, vaultId) reads this from the query cache (seeded on mount),
// so the InvitationModal shows its member list. No session → buttons stay
// disabled, which is fine for a design preview.
const invitedDetail: Vault = {
  id: invitedSummary.id,
  name: invitedSummary.name,
  theme: invitedSummary.theme,
  icon: null,
  network: invitedSummary.network,
  status: 'pending',
  createdBy: 'u0',
  createdAt: '',
  members: [
    { membershipId: 'im1', address: ME, name: 'Me', membershipStatus: 'invited', user: null },
    { membershipId: 'im2', address: ADDR_2, name: 'Amber', membershipStatus: 'joined', user: null },
    { membershipId: 'im3', address: ADDR_3, name: 'Jane', membershipStatus: 'joined', user: null },
  ],
};

function txSummary(
  id: string,
  network: AuthNetworkId,
  status: MultisigTransactionStatus,
  minutesAgo: number,
  approvalCount: number,
  vaultName: string,
  value?: { amount: string; fiat: string }
): TransactionListItem {
  return {
    vaultId: vault.id,
    threshold: account.threshold,
    subtitle: vaultName,
    amount: value?.amount,
    fiat: value?.fiat,
    transaction: {
      id,
      vaultAccountId: account.id,
      network,
      proposerUserId: 'u1',
      proposalTimestamp: nowSeconds - minutesAgo * 60,
      nonce: null,
      txId: null,
      status,
      broadcastAt: null,
      createdAt: '',
      updatedAt: '',
      approvalCount,
    },
  };
}

const txItems: TransactionListItem[] = [
  txSummary('1', 'stx:mainnet', 'pending', 8, 1, 'Team Treasury'),
  txSummary('2', 'btc:mainnet', 'pending', 26, 1, 'Vault One'),
  txSummary('3', 'stx:mainnet', 'broadcast', 70, 2, 'Team Treasury', {
    amount: '40.00 STX',
    fiat: '$79.60',
  }),
  txSummary('4', 'stx:mainnet', 'confirmed', 240, 2, 'Team Treasury', {
    amount: '125.00 STX',
    fiat: '$248.75',
  }),
  txSummary('6', 'btc:mainnet', 'confirmed', 900, 2, 'Vault One', {
    amount: '0.0425 BTC',
    fiat: '$2,810.00',
  }),
  txSummary('5', 'btc:mainnet', 'failed', 1440, 1, 'Vault One', {
    amount: '8.50 STX',
    fiat: '$16.91',
  }),
];
const accountItems = txItems.map(item => ({ ...item, subtitle: undefined }));

const mockTx: MultisigTransaction = {
  id: 'tx-preview',
  vaultAccountId: account.id,
  network: NETWORK,
  proposerUserId: 'u1',
  proposalRawPayload: '',
  proposalSignature: '',
  proposalTimestamp: nowSeconds - 90 * 60,
  proposalHash: '',
  nonce: 12,
  txId: null,
  status: 'pending',
  signatures: [{ userId: 'u1', signerIndex: 0, signature: 'sig', inputIndex: null, createdAt: '' }],
  broadcastAt: null,
  createdAt: '',
  updatedAt: '',
};

// VaultCard fetches its own balance, so the dashboard preview uses a lightweight
// stand-in tile mirroring its shape and trailing states.
function VaultCardMock({ summary, onClick }: { summary: VaultSummary; onClick?(): void }) {
  const chain = summary.network.startsWith('btc') ? 'btc' : 'stx';
  const chainLabel = chain === 'btc' ? 'Bitcoin' : 'Stacks';
  const invited = summary.membershipStatus === 'invited';
  const interactiveHover = onClick ? { bg: 'ink.component-background-hover' } : undefined;
  return (
    <Box
      onClick={onClick}
      cursor={onClick ? 'pointer' : undefined}
      p="space.04"
      borderRadius="md"
      borderWidth="1px"
      borderStyle="solid"
      borderColor="ink.border-default"
      bgImage={invited ? 'var(--multisig-collecting-wash)' : undefined}
      _hover={invited ? { bgImage: 'var(--multisig-collecting-wash-hover)' } : interactiveHover}
    >
      <ListItemBox
        variant="plain"
        leading={<AvatarSq chain={chain} icon="vault" themeId={orangeTheme} size="md" />}
        title={<styled.span textStyle="heading.05">{summary.name}</styled.span>}
        caption={`${chainLabel} vault · ${summary.accountCount} ${summary.accountCount === 1 ? 'account' : 'accounts'}`}
        trailing={
          invited ? (
            <Badge variant="pending" label="Invitation" />
          ) : (
            <styled.span textStyle="heading.05">—</styled.span>
          )
        }
      />
    </Box>
  );
}

function PageFrame({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Box mb="space.11">
      <styled.h2
        textStyle="heading.04"
        mb="space.05"
        pb="space.02"
        borderBottomWidth="1px"
        borderBottomStyle="solid"
        borderBottomColor="ink.border-default"
      >
        {label}
      </styled.h2>
      {children}
    </Box>
  );
}

function TwoCol({ main, side }: { main: ReactNode; side: ReactNode }) {
  return (
    <Flex
      direction={['column', 'column', 'row']}
      gap={['space.06', 'space.06', 'space.08', 'space.10']}
      alignItems="flex-start"
    >
      <Box flex={['1', '1', '1.6']} minWidth={0} width="100%">
        {main}
      </Box>
      <Box width={{ base: '100%', xl: '420px' }} flexShrink={0}>
        {side}
      </Box>
    </Flex>
  );
}

function CreateVaultPreview() {
  const [name, setName] = useState('Team Treasury');
  const [themeId, setThemeId] = useState(orangeTheme);
  const [draftMembers, setDraftMembers] = useState<MemberDraft[]>([
    { id: 'd1', addr: ME, name: 'Me', isMe: true },
    { id: 'd2', addr: ADDR_2, name: 'Amber' },
    { id: 'd3', addr: '', name: '' },
  ]);
  const statuses = draftMembers.map(m => ({
    state: m.addr ? ('valid' as const) : ('empty' as const),
  }));
  return (
    <TwoCol
      main={
        <Flex direction="column" gap="space.05">
          <Box>
            <SectionLabel noGutter>Chain</SectionLabel>
            <ChainPicker
              chain="stx"
              connected={{ btc: true, stx: true }}
              onChange={() => undefined}
            />
          </Box>
          <Box>
            <SectionLabel>Theme</SectionLabel>
            <ThemePicker themeId={themeId} onChange={setThemeId} />
          </Box>
          <Box>
            <SectionLabel>Members</SectionLabel>
            <MemberRows
              chain="stx"
              members={draftMembers}
              myAddress={ME}
              statuses={statuses}
              onChange={setDraftMembers}
            />
          </Box>
        </Flex>
      }
      side={
        <VaultPreviewCard
          chain="stx"
          name={name}
          themeId={themeId}
          members={draftMembers}
          myAddress={ME}
          onSubmit={() => setName(name)}
        />
      }
    />
  );
}

function ModalsPreview() {
  const [showCancel, setShowCancel] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  return (
    <>
      <Flex gap="space.03" flexWrap="wrap">
        <Button variant="outline" onClick={() => setShowShare(true)}>
          Share invitations
        </Button>
        <Button variant="outline" onClick={() => setShowCreateAccount(true)}>
          Create account
        </Button>
        <Button variant="outline" onClick={() => setShowCancel(true)}>
          Cancel vault
        </Button>
      </Flex>
      <ShareInvitationsModal
        vault={vault}
        currentUserAddress={ME}
        isShowing={showShare}
        onClose={() => setShowShare(false)}
      />
      <CreateAccountModal
        vault={vault}
        nextIndex={1}
        isShowing={showCreateAccount}
        onClose={() => setShowCreateAccount(false)}
      />
      <CancelVaultModal
        vaultName={vault.name}
        isShowing={showCancel}
        isCancelling={false}
        onConfirm={() => setShowCancel(false)}
        onClose={() => setShowCancel(false)}
      />
    </>
  );
}

export function PagesPreviewPage() {
  const [showInvite, setShowInvite] = useState(false);
  const queryClient = useQueryClient();
  useEffect(() => {
    queryClient.setQueryData(
      multisigVaultKeys.detail(invitedSummary.network, undefined, invitedSummary.id),
      invitedDetail
    );
  }, [queryClient]);
  return (
    <Box p="space.07" maxWidth="1200px">
      <styled.h1 textStyle="heading.04" mb="space.02">
        Multisig pages in context — local preview
      </styled.h1>
      <styled.p textStyle="caption.01" color="ink.text-subdued" mb="space.09">
        Every view reconstructed with mock data + the real components, main + sidebar stacked.
        Dev-only — stripped before the PR.
      </styled.p>

      <PageFrame label="Dashboard">
        <TwoCol
          main={
            <>
              <SectionLabel noGutter>My vaults</SectionLabel>
              <Flex direction="column" gap="space.03">
                {vaultSummaries.map(summary => (
                  <VaultCardMock
                    key={summary.id}
                    summary={summary}
                    onClick={
                      summary.membershipStatus === 'invited' ? () => setShowInvite(true) : undefined
                    }
                  />
                ))}
                <CreateVaultTile onClick={() => undefined} />
              </Flex>
            </>
          }
          side={
            <>
              <SectionLabel noGutter>Activity</SectionLabel>
              <TransactionList items={txItems} scale="compact" onSelect={() => undefined} />
            </>
          }
        />
      </PageFrame>

      <PageFrame label="Account">
        <TwoCol
          main={
            <>
              <MultisigHero
                variant="balance"
                themeId={orangeTheme}
                primary={<styled.span>1,250.00 STX</styled.span>}
                secondary={<styled.span>$2,318.40</styled.span>}
              />
              <SectionLabel>Transactions</SectionLabel>
              <TransactionList items={accountItems} scale="regular" onSelect={() => undefined} />
            </>
          }
          side={
            <>
              <SectionLabel noGutter>Account details</SectionLabel>
              <AccountDetailsCard
                vault={vault}
                account={account}
                currentUserAddress={ME}
                onAddToWallet={() => undefined}
              />
            </>
          }
        />
      </PageFrame>

      <PageFrame label="Vault">
        <TwoCol
          main={
            <>
              <MultisigHero
                variant="balance"
                themeId={blueTheme}
                primary={<styled.span>0.0452 BTC</styled.span>}
                secondary={<styled.span>$3,140.00</styled.span>}
              />
              <SectionLabel>Vault accounts</SectionLabel>
              <AccountsSection
                vault={vault}
                accounts={mockAccountSummaries}
                isLoading={false}
                canCreate
                onCreateAccount={() => undefined}
                onOpenAccount={() => undefined}
              />
              <SectionLabel>Vault members</SectionLabel>
              <MembersSection
                vault={vault}
                currentUserAddress={ME}
                onShareInvite={() => undefined}
              />
            </>
          }
          side={
            <>
              <SectionLabel noGutter>Team Treasury details</SectionLabel>
              <VaultStatusCard
                vault={vault}
                canCancel
                isCancelling={false}
                pendingCount={1}
                onShareInvite={() => undefined}
                onCancelVault={() => undefined}
              />
              <SectionLabel>Transactions</SectionLabel>
              <TransactionList items={txItems} scale="compact" onSelect={() => undefined} />
            </>
          }
        />
      </PageFrame>

      <PageFrame label="Create vault">
        <CreateVaultPreview />
      </PageFrame>

      <PageFrame label="Transaction detail">
        <TwoCol
          main={
            <>
              <MultisigHero
                variant="balance"
                themeId={orangeTheme}
                primary="Transfer"
                secondary={<styled.span>Proposed 2h ago by Amber</styled.span>}
              />
              <SectionLabel>Transaction details</SectionLabel>
              <TxDetailsTable
                transaction={mockTx}
                status="pending"
                proposerLabel="Amber"
                initiationDate="2h ago"
                recipient={ADDR_2}
              />
            </>
          }
          side={
            <>
              <SectionLabel noGutter>Signatures</SectionLabel>
              <SignerRollcall
                vault={vault}
                account={account}
                transaction={mockTx}
                currentUserAddress={ME}
                isSigning={false}
                isCancelling={false}
                isBroadcasting={false}
                onSign={() => undefined}
                onCancel={() => undefined}
                onBroadcast={() => undefined}
              />
            </>
          }
        />
      </PageFrame>

      <PageFrame label="Modals">
        <ModalsPreview />
      </PageFrame>

      <InvitationModal
        vault={invitedSummary}
        isShowing={showInvite}
        onClose={() => setShowInvite(false)}
      />
    </Box>
  );
}
