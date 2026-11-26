import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import type { Vault, VaultAccount } from '@leather.io/models';

import { AccountWalletOffer } from './account-wallet-offer';

vi.mock('~/features/multisig/vaults/use-add-account-to-wallet', () => ({}));
vi.mock('~/features/multisig/vaults/use-vault-accounts', () => ({}));

const vault: Vault = {
  id: 'vault',
  name: 'Team vault',
  theme: null,
  icon: null,
  network: 'stx:mainnet',
  status: 'active',
  createdBy: 'creator',
  createdAt: '',
  members: [],
};
const account: VaultAccount = {
  id: 'treasury',
  vaultId: vault.id,
  name: 'Treasury',
  icon: null,
  network: vault.network,
  threshold: 1,
  multisigAddress: '',
  accountIndex: 0,
  createdAt: '',
  pendingTransactionCount: 0,
  queuedTransactionCount: 0,
  signers: [],
};

afterEach(cleanup);

describe(AccountWalletOffer.name, () => {
  test('dismisses for this visit and keeps the add action and guide available on the page', () => {
    const onAdd = vi.fn();
    const props = { vault, account, canOpenSheet: true, isAdding: false, onAdd };
    const view = render(<AccountWalletOffer {...props} />);
    const dialog = within(screen.getByRole('dialog'));
    expect(dialog.getByText(account.name)).toBeDefined();
    expect(dialog.getByRole('link', { name: /Learn more/i })).toBeDefined();
    expect(onAdd).not.toHaveBeenCalled();
    fireEvent.click(dialog.getByRole('button', { name: 'Not now' }));

    view.rerender(<AccountWalletOffer {...props} />);
    expect(screen.queryByRole('dialog')).toBeNull();
    const guide = screen.getByRole('link', { name: /Learn more/i });
    const add = screen.getByRole('button', { name: 'Add to extension: Treasury' });
    expect(add.textContent).toContain('Add to extension');
    expect(screen.getByText('Leather extension')).toBeDefined();
    expect(screen.getByText('Use this account with apps in this browser.').contains(guide)).toBe(
      true
    );
    expect(add.contains(guide)).toBe(false);
    expect(guide.getAttribute('target')).toBe('_blank');
    fireEvent.click(add);
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  test('keeps the sheet closed behind another dialog and disables adding while pending', () => {
    const onAdd = vi.fn();
    const props = { vault, account, canOpenSheet: false, isAdding: false, onAdd };
    const view = render(<AccountWalletOffer {...props} />);
    expect(screen.queryByRole('dialog')).toBeNull();
    view.rerender(<AccountWalletOffer {...props} canOpenSheet isAdding />);
    const button = within(screen.getByRole('dialog')).getByRole('button', {
      name: 'Add to extension: Treasury',
    });
    fireEvent.click(button);
    expect(onAdd).not.toHaveBeenCalled();
    view.rerender(<AccountWalletOffer {...props} canOpenSheet />);
    fireEvent.click(button);
    expect(onAdd).toHaveBeenCalledTimes(1);
  });
});
