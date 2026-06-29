import { Box, Flex, styled } from 'leather-styles/jsx';

import type {
  AuthNetworkId,
  MultisigTransactionStatus,
  Vault,
  VaultAccount,
  VaultAccountSigner,
  VaultMember,
  VaultSummary,
} from '@leather.io/models';

import { AccountDetailsCard } from '../account/components/account-details-card';
import { MultisigHero } from '../components/multisig-hero';
import { TransactionList, type TransactionListItem } from '../components/transaction-list';
import { VaultBalanceHero } from '../vault/components/vault-balance-hero';
import { VaultStatusCard } from '../vault/components/vault-status-card';

// Dev-only: the activity / transaction feed shown in each real page context
// (dashboard sidebar, account main column, vault sidebar) with mock data and the
// real components. Self-fetching neighbors (vault-card balances) render empty —
// the feed and the presentational chrome are faithful.
const NETWORK: AuthNetworkId = 'stx:mainnet';
const ME = 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKQVX8X0G';
const ADDR_2 = 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE';
const ADDR_3 = 'SP1H1733V5MZ3SZ9XRW9FKYGEZT0JDGEB8Y634C7R';
const nowSeconds = Math.floor(Date.now() / 1000);

const members: VaultMember[] = [
  { membershipId: 'm1', address: ME, name: 'Me', membershipStatus: 'joined', user: null },
  { membershipId: 'm2', address: ADDR_2, name: 'Amber', membershipStatus: 'joined', user: null },
  { membershipId: 'm3', address: ADDR_3, name: 'Jane', membershipStatus: 'joined', user: null },
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
  {
    id: 'v2',
    name: 'Vault One',
    theme: 'Blue',
    icon: null,
    network: 'btc:mainnet',
    status: 'active',
    createdBy: 'u0',
    createdAt: '',
    membershipStatus: 'joined',
    memberCount: 2,
    accountCount: 1,
  },
];

function txSummary(
  id: string,
  network: AuthNetworkId,
  status: MultisigTransactionStatus,
  minutesAgo: number,
  approvalCount: number,
  vaultName: string
): TransactionListItem {
  return {
    vaultId: vault.id,
    threshold: account.threshold,
    subtitle: vaultName,
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
  txSummary('3', 'stx:mainnet', 'broadcast', 70, 2, 'Team Treasury'),
  txSummary('4', 'stx:mainnet', 'confirmed', 240, 2, 'Team Treasury'),
  txSummary('5', 'btc:mainnet', 'failed', 1440, 1, 'Vault One'),
];

const accountItems = txItems.map(item => ({ ...item, subtitle: undefined }));

function SectionLabel({ children }: { children: string }) {
  return (
    <styled.h3 textStyle="label.01" color="ink.text-primary" mb="space.03">
      {children}
    </styled.h3>
  );
}

function ContextFrame({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box mb="space.11">
      <styled.h2
        textStyle="heading.05"
        mb="space.05"
        pb="space.02"
        borderBottomWidth="1px"
        borderBottomStyle="solid"
        borderBottomColor="ink.border-default"
      >
        {label}
      </styled.h2>
      <Flex
        direction={['column', 'column', 'row']}
        gap={['space.06', 'space.06', 'space.08', 'space.10']}
        alignItems="flex-start"
      >
        {children}
      </Flex>
    </Box>
  );
}

export function ContextPreviewPage() {
  return (
    <Box p="space.07" bg="ink.background-primary">
      <styled.h1 textStyle="heading.04" mb="space.02">
        Activity in context — local preview (on #2435)
      </styled.h1>
      <styled.p textStyle="caption.01" color="ink.text-subdued" mb="space.07">
        The feed in its real page slots, mock data. Vault-card balances render empty (they fetch
        live) — the feed and presentational chrome are faithful.
      </styled.p>

      <ContextFrame label="Dashboard">
        <Box flex={['1', '1', '1.6']} minWidth={0} width="100%">
          <SectionLabel>My vaults</SectionLabel>
          <Flex direction="column" gap="space.03">
            {vaultSummaries.map(summary => (
              <VaultCardMock key={summary.id} summary={summary} />
            ))}
          </Flex>
        </Box>
        <Box flex={['1', '1', '1']} width="100%">
          <SectionLabel>Activity</SectionLabel>
          <TransactionList items={txItems} scale="compact" onSelect={() => undefined} />
        </Box>
      </ContextFrame>

      <ContextFrame label="Account">
        <Box flex={['1', '1', '1.6']} minWidth={0} width="100%">
          <MultisigHero
            themeId={3}
            primary={<styled.div textStyle="heading.04">1,250.00 STX</styled.div>}
            secondary={<styled.div textStyle="label.02">$2,318.40</styled.div>}
          />
          <Box mt="space.05">
            <SectionLabel>Transactions</SectionLabel>
            <TransactionList items={accountItems} scale="regular" onSelect={() => undefined} />
          </Box>
        </Box>
        <Box width={{ base: '100%', xl: '420px' }} flexShrink={0}>
          <SectionLabel>Account details</SectionLabel>
          <AccountDetailsCard
            vault={vault}
            account={account}
            currentUserAddress={ME}
            onAddToWallet={() => undefined}
          />
        </Box>
      </ContextFrame>

      <ContextFrame label="Vault">
        <Box flex={['1', '1', '1.6']} minWidth={0} width="100%">
          <VaultBalanceHero vault={vault} crypto={undefined} fiat={undefined} />
        </Box>
        <Box flex={['1', '1', '1']} width="100%">
          <SectionLabel>Team Treasury details</SectionLabel>
          <VaultStatusCard
            vault={vault}
            canCancel={false}
            isCancelling={false}
            pendingCount={0}
            onShareInvite={() => undefined}
            onCancelVault={() => undefined}
          />
          <Box mt="space.05">
            <SectionLabel>Transactions</SectionLabel>
            <TransactionList items={txItems} scale="compact" onSelect={() => undefined} />
          </Box>
        </Box>
      </ContextFrame>
    </Box>
  );
}

// VaultCard pulls its balance from live hooks (empty here), so the dashboard
// preview uses a lightweight stand-in tile that mirrors its shape.
function VaultCardMock({ summary }: { summary: VaultSummary }) {
  const chainLabel = summary.network.startsWith('btc') ? 'Bitcoin' : 'Stacks';
  return (
    <Box
      p="space.04"
      borderRadius="md"
      borderWidth="1px"
      borderStyle="solid"
      borderColor="ink.border-default"
    >
      <Flex justifyContent="space-between" alignItems="center" gap="space.03">
        <Box minWidth={0}>
          <styled.div textStyle="heading.05">{summary.name}</styled.div>
          <styled.div textStyle="caption.01" color="ink.text-subdued">
            {chainLabel} vault · {summary.accountCount}{' '}
            {summary.accountCount === 1 ? 'account' : 'accounts'}
          </styled.div>
        </Box>
        <styled.div textStyle="heading.05" color="ink.text-subdued">
          —
        </styled.div>
      </Flex>
    </Box>
  );
}
