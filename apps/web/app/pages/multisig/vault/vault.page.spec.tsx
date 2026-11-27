import type { ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'jotai';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { multisigVaultKeys } from '~/features/multisig/vaults/vault-query-keys';
import { ToastContext } from '~/features/toasts/use-toast';

import type { MultisigUser, Vault, VaultAccount, VaultAccountSummary } from '@leather.io/models';
import { Tooltip } from '@leather.io/ui';

import { VaultDetailPage } from './vault.page';

const mocks = vi.hoisted(() => ({
  vault: vi.fn<() => Vault>(),
  me: vi.fn<() => Pick<MultisigUser, 'id' | 'address'>>(),
  listAccounts: vi.fn(),
  getAccount: vi.fn(),
  createAccount: vi.fn(),
  stxAddAccount: vi.fn(),
}));

vi.mock('~/features/multisig/auth/use-multisig-networks', () => ({
  useMultisigNetworks: () => ({ btc: 'btc:mainnet', stx: 'stx:mainnet' }),
}));
vi.mock('~/features/multisig/auth/use-session', () => ({
  useSession: () => ({ identity: { address: 'member-address' } }),
}));
vi.mock('~/features/multisig/auth/use-session-bootstrap', () => ({
  useIsRestoringSession: () => false,
}));
vi.mock('~/features/multisig/vaults/use-multisig-me', () => ({
  useMultisigMe: () => ({ data: mocks.me() }),
}));
vi.mock('~/features/multisig/vaults/use-vaults', () => ({
  useVault: (_network: string, id?: string) => ({
    data: id ? mocks.vault() : undefined,
    isSuccess: true,
  }),
  useVaults: (network: string) => ({
    data: network === 'stx:mainnet' ? [mocks.vault()] : [],
    isSuccess: true,
  }),
  retryMultisigQuery: () => false,
}));
vi.mock('~/features/multisig/vaults/use-vault-mutations', () => ({
  useCancelVault: () => ({}),
  useDeclineVault: () => ({}),
  useJoinVault: () => ({}),
  useUpdateVault: () => ({}),
  useUpdateVaultMember: () => ({}),
}));
vi.mock('~/features/multisig/vaults/use-vault-account-balance', () => ({
  useVaultAccountBalance: () => ({}),
  useVaultAccountsBalance: () => ({}),
}));
vi.mock('~/features/multisig/extension/multisig-leather-client', () => ({
  multisigLeather: { stxAddAccount: mocks.stxAddAccount },
}));
vi.mock('~/utils/utils', () => ({ isLeatherInstalled: () => true }));
vi.mock('@leather.io/bitcoin', () => ({}));
vi.mock('@leather.io/services', () => ({
  getErrorDetail: () => undefined,
  getMultisigService: () => ({
    listVaultAccounts: mocks.listAccounts,
    getVaultAccount: mocks.getAccount,
    createVaultAccount: mocks.createAccount,
  }),
}));
vi.mock('../components/multisig-page', () => ({
  MultisigPage: ({ children }: { children: ReactNode }) => children,
}));
vi.mock('./components/members-section', () => ({ MembersSection: () => null }));
vi.mock('./components/vault-transactions', () => ({ VaultTransactions: () => null }));

const toast = { error: vi.fn(), success: vi.fn(), info: vi.fn() };
const vault: Vault = {
  id: 'vault-1',
  name: 'Shared vault',
  theme: null,
  icon: null,
  network: 'stx:mainnet',
  status: 'active',
  createdBy: 'creator',
  createdAt: '2026-11-01T00:00:00Z',
  members: [
    {
      membershipId: 'membership-1',
      address: 'member-address',
      name: 'Member',
      membershipStatus: 'joined',
      user: null,
    },
  ],
};
const treasury: VaultAccount & VaultAccountSummary = {
  id: 'treasury-1',
  vaultId: vault.id,
  name: 'Treasury',
  icon: null,
  network: vault.network,
  threshold: 1,
  multisigAddress: 'SM2ZD8K9J3XYE7WQ4N5H6VBRFC0TPGA1MKS3JBNVY',
  accountIndex: 0,
  signerCount: 1,
  createdAt: vault.createdAt,
  pendingTransactionCount: 0,
  queuedTransactionCount: 0,
  signers: [],
};
const operations = { ...treasury, id: 'operations-1', name: 'Operations' };
const firstPromptTitle = 'Create the first account in this vault';
const addPromptTitle = /Add vault accounts? to Leather/;

function visit(queryClient: QueryClient) {
  return render(
    <QueryClientProvider client={queryClient}>
      <Provider>
        <ToastContext.Provider value={toast}>
          <Tooltip.Provider>
            <MemoryRouter initialEntries={[`/multisig/vault/${vault.id}`]}>
              <Routes>
                <Route path="/multisig/vault/:vaultId" element={<VaultDetailPage />} />
              </Routes>
            </MemoryRouter>
          </Tooltip.Provider>
        </ToastContext.Provider>
      </Provider>
    </QueryClientProvider>
  );
}

beforeEach(() => {
  vi.resetAllMocks();
  localStorage.clear();
  mocks.vault.mockReturnValue(vault);
  mocks.me.mockReturnValue({ id: vault.createdBy, address: 'member-address' });
  mocks.listAccounts.mockResolvedValue([]);
});

afterEach(cleanup);

describe(VaultDetailPage.name, () => {
  test('does not infer an empty vault from a failed accounts query', async () => {
    const queryClient = new QueryClient();
    const accountsKey = multisigVaultKeys.accounts(vault.network, 'member-address', vault.id);
    mocks.listAccounts.mockRejectedValue(new Error('Vault accounts unavailable'));
    visit(queryClient);

    expect(screen.queryByRole('heading', { name: firstPromptTitle })).toBeNull();
    await waitFor(() => expect(queryClient.getQueryState(accountsKey)?.status).toBe('error'));
    expect(screen.queryByRole('heading', { name: firstPromptTitle })).toBeNull();
    expect(screen.queryByRole('heading', { name: addPromptTitle })).toBeNull();
  });

  test('defers the creation prompt after dismissal and the add prompt after post-create dismissal until a new visit', async () => {
    const queryClient = new QueryClient();
    const initialVisit = visit(queryClient);
    await screen.findByRole('heading', { name: firstPromptTitle });
    fireEvent.click(screen.getByRole('button', { name: 'Not now' }));
    await act(() => queryClient.invalidateQueries());
    expect(screen.queryByRole('heading', { name: firstPromptTitle })).toBeNull();
    initialVisit.unmount();

    const secondVisit = visit(queryClient);
    await screen.findByRole('heading', { name: firstPromptTitle });
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
    fireEvent.change(screen.getByPlaceholderText('Account name'), {
      target: { value: treasury.name },
    });
    fireEvent.click(screen.getByRole('button', { name: '1' }));
    mocks.createAccount.mockImplementation(() => {
      mocks.listAccounts.mockResolvedValue([treasury]);
      return Promise.resolve(treasury);
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create vault account' }));
    await screen.findByRole('heading', { name: 'Account created' });
    expect(screen.getByRole('button', { name: 'Add to extension' })).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'Not now' }));
    await act(() => queryClient.invalidateQueries());
    expect(screen.getByRole('button', { name: 'Open Treasury' })).toBeDefined();
    expect(screen.queryByRole('heading', { name: addPromptTitle })).toBeNull();
    secondVisit.unmount();

    visit(queryClient);
    await screen.findByRole('heading', { name: addPromptTitle });
    expect(screen.getByRole('button', { name: 'Add to extension: Treasury' })).toBeDefined();
    expect(mocks.stxAddAccount).not.toHaveBeenCalled();
  });

  test('keeps failed adds available for a joined noncreator and closes after the last success', async () => {
    const queryClient = new QueryClient();
    mocks.me.mockReturnValue({ id: 'another-member', address: 'member-address' });
    mocks.listAccounts.mockResolvedValue([treasury, operations]);
    mocks.getAccount.mockImplementation((_network: string, id: string) =>
      Promise.resolve(id === treasury.id ? treasury : operations)
    );
    mocks.stxAddAccount.mockRejectedValueOnce(new Error('Declined')).mockResolvedValue(undefined);

    const initialVisit = visit(queryClient);
    await screen.findByRole('heading', { name: addPromptTitle });
    expect(mocks.getAccount).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Not now' }));
    await act(() => queryClient.invalidateQueries());
    expect(screen.queryByRole('heading', { name: addPromptTitle })).toBeNull();
    initialVisit.unmount();

    const secondVisit = visit(queryClient);
    const treasuryButton = await screen.findByRole('button', {
      name: 'Add to extension: Treasury',
    });
    fireEvent.click(treasuryButton);
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Declined'));
    expect(screen.getByRole('button', { name: 'Add to extension: Operations' })).toBeDefined();
    expect(treasuryButton).toBeDefined();

    fireEvent.click(treasuryButton);
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Add to extension: Treasury' })).toBeNull()
    );
    fireEvent.click(screen.getByRole('button', { name: 'Add to extension: Operations' }));
    await waitFor(() => expect(screen.queryByRole('heading', { name: addPromptTitle })).toBeNull());
    secondVisit.unmount();

    visit(queryClient);
    await screen.findByRole('button', { name: 'Open Treasury' });
    expect(screen.queryByRole('heading', { name: addPromptTitle })).toBeNull();
    expect(mocks.stxAddAccount).toHaveBeenCalledTimes(3);
  });
});
