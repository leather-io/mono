import { MemoryRouter } from 'react-router';

import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { harmonizeVaultActivity } from '~/features/multisig/activity/harmonize-vault-activity';

import type { MultisigTransactionSummary } from '@leather.io/models';
import { Button } from '@leather.io/ui';

import { VaultActivityList } from './vault-activity-list';

vi.mock('@leather.io/bitcoin', () => ({}));
vi.mock('@leather.io/services', () => ({}));

function proposal(
  id: string,
  status: MultisigTransactionSummary['status'],
  overrides: Partial<MultisigTransactionSummary> = {}
) {
  const transaction: MultisigTransactionSummary = {
    id,
    status,
    vaultAccountId: 'account-1',
    network: 'stx:testnet',
    proposerUserId: 'user-1',
    proposalTimestamp: 1751000000,
    nonce: null,
    txId: null,
    broadcastAt: null,
    createdAt: '2026-06-27T00:00:00Z',
    updatedAt: '2026-06-27T00:00:00Z',
    approvalCount: 0,
    signedByMe: false,
    ...overrides,
  };
  return {
    transaction,
    vaultId: 'vault-1',
    payloadContext: { network: transaction.network, multisigAddress: 'account-address' },
  };
}

function renderActivity(proposals: ReturnType<typeof proposal>[], limit?: number) {
  const onSelect = vi.fn();
  const items = harmonizeVaultActivity({ onchain: [], multisigTransactions: proposals });
  render(
    <MemoryRouter>
      <VaultActivityList items={items} prioritizeProposals limit={limit} onSelect={onSelect} />
      <Button variant="solid" size="sm">
        Primary reference
      </Button>
      <Button variant="outline" size="sm">
        Secondary reference
      </Button>
    </MemoryRouter>
  );
  return onSelect;
}

afterEach(cleanup);

describe(VaultActivityList.name, () => {
  test('promotes the signed proposal before the list limit and gives queued rows secondary review', () => {
    const onSelect = renderActivity(
      [
        proposal('queued-1', 'queued'),
        proposal('queued-2', 'queued'),
        proposal('ready', 'signed', { proposalTimestamp: 1750000000, signedByMe: true }),
        proposal('extra', 'queued', { proposalTimestamp: 1750000100 }),
      ],
      3
    );

    expect(screen.getAllByRole('heading').map(heading => heading.textContent)).toEqual([
      'Ready to broadcast',
      'In progress',
    ]);
    const [ready, firstQueued, secondQueued] = screen.getAllByRole('button', { name: 'Review' });
    expect(ready.className).toBe(
      screen.getByRole('button', { name: 'Primary reference' }).className
    );
    expect(firstQueued.className).toBe(
      screen.getByRole('button', { name: 'Secondary reference' }).className
    );
    expect(secondQueued.className).toBe(firstQueued.className);

    fireEvent.click(ready);
    expect(onSelect).toHaveBeenLastCalledWith('vault-1', 'ready');
    fireEvent.click(firstQueued);
    expect(onSelect).toHaveBeenLastCalledWith('vault-1', 'queued-1');
  });

  test('shows primary review on a second account and secondary review where the member already signed', () => {
    const onSelect = renderActivity([
      proposal('already-signed', 'pending', { signedByMe: true }),
      proposal('can-sign', 'pending', { vaultAccountId: 'account-2' }),
      proposal('broadcast', 'broadcast'),
    ]);

    const [actionable, waiting] = screen.getAllByRole('button', { name: 'Review' });
    expect(screen.getAllByRole('button', { name: 'Review' })).toHaveLength(2);
    expect(actionable.className).toBe(
      screen.getByRole('button', { name: 'Primary reference' }).className
    );
    expect(waiting.className).toBe(
      screen.getByRole('button', { name: 'Secondary reference' }).className
    );
    fireEvent.click(actionable);
    expect(onSelect).toHaveBeenLastCalledWith('vault-1', 'can-sign');
    fireEvent.click(waiting);
    expect(onSelect).toHaveBeenLastCalledWith('vault-1', 'already-signed');
  });

  test('shows the ready-to-broadcast label when it is the only tier', () => {
    renderActivity([proposal('ready', 'signed')]);

    const heading = screen.getByRole('heading', { name: 'Ready to broadcast' });
    expect(
      heading.parentElement &&
        within(heading.parentElement).getByRole('button', {
          name: 'Review',
        })
    ).toBeTruthy();
  });
});
