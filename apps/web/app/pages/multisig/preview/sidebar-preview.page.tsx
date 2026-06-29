import { Box, styled } from 'leather-styles/jsx';

import type {
  AuthNetworkId,
  MultisigTransaction,
  MultisigTransactionStatus,
  Vault,
  VaultAccount,
  VaultAccountSigner,
  VaultMember,
} from '@leather.io/models';

import { AccountDetailsCard } from '../account/components/account-details-card';
import { TransactionList, type TransactionListItem } from '../components/transaction-list';
import { SignerRollcall } from '../tx/components/signer-rollcall';
import { VaultStatusCard } from '../vault/components/vault-status-card';

// Dev-only preview: every sidebar panel rendered with mock data so the whole
// sidebar column can be reviewed for scale consistency without a wallet.
const NETWORK: AuthNetworkId = 'stx:mainnet';
const ME = 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKQVX8X0G';
const ADDR_2 = 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE';
const ADDR_3 = 'SP1H1733V5MZ3SZ9XRW9FKYGEZT0JDGEB8Y634C7R';
const nowSeconds = Math.floor(Date.now() / 1000);

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

// Amber (signerIndex 1) has signed; the current user has not, so the rollcall
// shows the Sign affordance.
const transaction: MultisigTransaction = {
  id: 'tx-preview',
  vaultAccountId: account.id,
  network: NETWORK,
  proposerUserId: 'u1',
  proposalRawPayload: '',
  proposalSignature: '',
  proposalTimestamp: nowSeconds - 8 * 60,
  proposalHash: '',
  nonce: null,
  txId: null,
  status: 'pending',
  signatures: [{ userId: 'u1', signerIndex: 1, signature: 'sig', inputIndex: null, createdAt: '' }],
  broadcastAt: null,
  createdAt: '',
  updatedAt: '',
};

function txSummary(
  id: string,
  status: MultisigTransactionStatus,
  minutesAgo: number,
  approvalCount: number
): TransactionListItem {
  return {
    vaultId: vault.id,
    threshold: account.threshold,
    transaction: {
      id,
      vaultAccountId: account.id,
      network: NETWORK,
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
  txSummary('1', 'pending', 8, 1),
  txSummary('2', 'broadcast', 70, 2),
  txSummary('3', 'confirmed', 240, 2),
];

function SectionLabel({ children }: { children: string }) {
  return (
    <styled.h3 textStyle="label.01" color="ink.text-primary" mb="space.03" mt="space.05">
      {children}
    </styled.h3>
  );
}

export function SidebarPreviewPage() {
  return (
    <Box p="space.07" bg="ink.background-primary">
      <styled.h1 textStyle="heading.05" mb="space.02">
        Sidebar contents — local preview (on #2435)
      </styled.h1>
      <styled.p textStyle="caption.01" color="ink.text-subdued" mb="space.06">
        Every sidebar panel at the current scale, mock data. Lists are at the compact scale; cards
        are unchanged (headers held).
      </styled.p>
      <Box width="360px">
        <styled.h3 textStyle="label.01" color="ink.text-primary" mb="space.03">
          Transactions
        </styled.h3>
        <TransactionList items={txItems} scale="compact" onSelect={() => undefined} />

        <SectionLabel>Vault details</SectionLabel>
        <VaultStatusCard
          vault={vault}
          canCancel={true}
          isCancelling={false}
          pendingCount={1}
          onShareInvite={() => undefined}
          onCancelVault={() => undefined}
        />

        <SectionLabel>Account details</SectionLabel>
        <AccountDetailsCard
          vault={vault}
          account={account}
          currentUserAddress={ME}
          onAddToWallet={() => undefined}
        />

        <SectionLabel>Signatures</SectionLabel>
        <SignerRollcall
          vault={vault}
          account={account}
          transaction={transaction}
          currentUserAddress={ME}
          isSigning={false}
          isCancelling={false}
          isBroadcasting={false}
          onSign={() => undefined}
          onCancel={() => undefined}
          onBroadcast={() => undefined}
        />
      </Box>
    </Box>
  );
}
