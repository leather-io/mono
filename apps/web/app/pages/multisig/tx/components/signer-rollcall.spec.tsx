import { MemoryRouter } from 'react-router';

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { findBlockingProposal } from '~/features/multisig/vaults/use-vault-transactions';

import type {
  MultisigTransaction,
  MultisigTransactionSummary,
  Vault,
  VaultAccount,
} from '@leather.io/models';

import { multisigGuides, multisigPaths } from '../../multisig.constants';
import { SignerRollcall } from './signer-rollcall';

vi.mock('@leather.io/bitcoin', () => ({}));
vi.mock('@leather.io/services', () => ({}));

const createdAt = '2026-06-27T00:00:00Z';
const vault: Vault = {
  id: 'vault-1',
  name: 'Treasury',
  theme: null,
  icon: null,
  network: 'stx:testnet',
  status: 'active',
  createdBy: 'user-1',
  createdAt,
  members: [],
};
const account: VaultAccount = {
  id: 'account-1',
  vaultId: vault.id,
  name: 'Operations',
  icon: null,
  network: vault.network,
  threshold: 2,
  multisigAddress: 'account-address',
  accountIndex: 0,
  createdAt,
  signers: [],
  pendingTransactionCount: 1,
  queuedTransactionCount: 2,
};
const queuedProposal: MultisigTransaction = {
  id: 'queued-1',
  vaultAccountId: account.id,
  network: account.network,
  proposerUserId: 'user-1',
  proposalRawPayload: '',
  proposalSignature: '',
  proposalHash: '',
  proposalTimestamp: 1751000000,
  nonce: null,
  txId: null,
  status: 'queued',
  signatures: [],
  broadcastAt: null,
  createdAt,
  updatedAt: createdAt,
};
const readyProposal: MultisigTransactionSummary = {
  ...queuedProposal,
  id: 'ready',
  nonce: 0,
  status: 'signed',
  approvalCount: 2,
  signedByMe: true,
};
const calloutText = 'Queued behind an active transaction';

function renderRollcall(proposals: MultisigTransactionSummary[]) {
  const blocker = findBlockingProposal(queuedProposal, proposals);
  render(
    <MemoryRouter>
      <SignerRollcall
        vault={vault}
        account={account}
        transaction={queuedProposal}
        blockingProposalHref={blocker ? multisigPaths.tx(vault.id, blocker.id) : undefined}
        isSigning={false}
        isCancelling={false}
        isBroadcasting={false}
        onSign={vi.fn()}
        onCancel={vi.fn()}
        onBroadcast={vi.fn()}
      />
    </MemoryRouter>
  );
}

afterEach(cleanup);

describe(SignerRollcall.name, () => {
  test('links a queued proposal to the active proposal on its own account and network', () => {
    renderRollcall([
      { ...readyProposal, id: 'different-account', vaultAccountId: 'account-2' },
      { ...readyProposal, id: 'different-network', network: 'stx:mainnet' },
      { ...readyProposal, id: 'queued-2', status: 'queued' },
      readyProposal,
    ]);

    expect(screen.getByRole('heading', { name: calloutText }).querySelector('a')).toBeNull();
    const view = screen.getByRole('link', { name: 'View active transaction' });
    expect(view.textContent).toBe('View');
    expect(view.getAttribute('href')).toBe('/multisig/vault/vault-1/tx/ready');
    expect(screen.getByRole('link', { name: /learn more/i }).getAttribute('href')).toBe(
      multisigGuides.signAndBroadcast
    );
  });

  test.each([
    { scenario: 'missing', proposals: [] },
    {
      scenario: 'ambiguous',
      proposals: [readyProposal, { ...readyProposal, id: 'also-active', status: 'pending' }],
    },
  ] satisfies { scenario: string; proposals: MultisigTransactionSummary[] }[])(
    'keeps the callout readable when the blocker is $scenario',
    ({ proposals }) => {
      renderRollcall(proposals);

      expect(screen.getByRole('heading', { name: calloutText })).toBeTruthy();
      expect(screen.queryByRole('link', { name: 'View active transaction' })).toBeNull();
    }
  );
});
