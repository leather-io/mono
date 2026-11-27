import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import type { Vault, VaultAccountSummary } from '@leather.io/models';
import { Tooltip } from '@leather.io/ui';

import { AccountsSection } from './accounts-section';
import { FirstVaultAccountPrompt } from './vault-account-setup';

vi.mock('~/features/multisig/vaults/use-add-account-to-wallet', () => ({}));
vi.mock('~/features/multisig/vaults/use-vault-account-balance', () => ({
  useVaultAccountBalance: () => ({}),
}));
vi.mock('~/features/multisig/vaults/use-vault-accounts', () => ({}));

const vault: Vault = {
  id: 'vault-1',
  name: 'Shared vault',
  theme: null,
  icon: null,
  network: 'stx:mainnet',
  status: 'active',
  createdBy: 'creator',
  createdAt: '2026-11-01T00:00:00Z',
  members: [],
};

const account: VaultAccountSummary = {
  id: 'account-1',
  vaultId: vault.id,
  name: 'Treasury',
  icon: null,
  network: vault.network,
  threshold: 1,
  multisigAddress: 'SM2ZD8K9J3XYE7WQ4N5H6VBRFC0TPGA1MKS3JBNVY',
  accountIndex: 0,
  signerCount: 1,
  createdAt: vault.createdAt,
};

function accountSection(
  accounts: VaultAccountSummary[] | undefined,
  options = { canCreate: true, isLoading: false }
) {
  return (
    <Tooltip.Provider>
      <AccountsSection
        vault={vault}
        accounts={accounts}
        isLoading={options.isLoading}
        isRecovering={false}
        recoveryFailed={false}
        onRetryRecovery={vi.fn()}
        canCreate={options.canCreate}
        disabledReason={
          options.canCreate ? undefined : 'Only the vault creator can create accounts.'
        }
        onCreateAccount={vi.fn()}
        onOpenAccount={vi.fn()}
      />
    </Tooltip.Provider>
  );
}

afterEach(cleanup);

describe(AccountsSection.name, () => {
  test('asks for the first account when the account list resolves empty', () => {
    render(accountSection([]));

    expect(screen.getByRole('button', { name: /Create your first account/ })).toBeDefined();
  });

  test.each([true, false])(
    'keeps the generic label with unavailable account data, loading=%s',
    isLoading => {
      render(accountSection(undefined, { canCreate: true, isLoading }));

      expect(screen.queryByRole('button', { name: /Create your first account/ })).toBeNull();
      expect(screen.getByRole('button', { name: /Create new account/ })).toBeDefined();
    }
  );

  test('offers another account when the vault already has one', () => {
    render(accountSection([account]));

    expect(screen.getByRole('button', { name: /Create new account/ })).toBeDefined();
  });

  test('preserves the creation restriction for a member', () => {
    render(accountSection([], { canCreate: false, isLoading: false }));

    expect(screen.queryByRole('button', { name: /Create .* account/ })).toBeNull();
    expect(screen.getByText('Only the vault creator can create accounts.')).toBeDefined();
  });
});

describe(FirstVaultAccountPrompt.name, () => {
  test('explains why this vault needs its first account and offers two actions', () => {
    const onClose = vi.fn();
    const onCreate = vi.fn();
    render(<FirstVaultAccountPrompt vault={vault} onClose={onClose} onCreate={onCreate} />);

    expect(
      screen.getByRole('heading', { name: 'Create the first account in this vault' })
    ).toBeDefined();
    expect(
      screen.getAllByText('This vault needs an account to receive funds and propose transactions.')
    ).toHaveLength(2);
    expect(screen.queryByRole('button', { name: 'Close' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Not now' }));
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    expect(onClose).toHaveBeenCalledOnce();
    expect(onCreate).toHaveBeenCalledOnce();
  });
});
