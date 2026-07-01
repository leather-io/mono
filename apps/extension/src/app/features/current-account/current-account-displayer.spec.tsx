import { renderToString } from 'react-dom/server';

import { CurrentAccountDisplayer } from './current-account-displayer';

const currentAccountId = { fingerprint: 'abc123', accountIndex: 0 };

const walletEntitiesMock = vi.fn();
const useCurrentPolicyMock = vi.fn();

vi.mock('react-redux', () => ({
  useSelector: () => ({ fingerprint: 'abc123' }),
}));

vi.mock('@app/store/policy/policy.selectors', () => ({
  useCurrentPolicy: () => useCurrentPolicyMock(),
  usePolicyDisplayName: () => 'Multisig 1234...5678',
}));

vi.mock('@app/components/account/policy-total-balance', () => ({
  PolicyTotalBalance: () => null,
}));

vi.mock('@app/store/accounts/account', () => ({
  useCurrentAccountId: () => currentAccountId,
}));

vi.mock('@app/store/accounts/blockchain/stacks/stacks-account.hooks', () => ({
  useStacksAccount: () => undefined,
}));

vi.mock('@app/common/hooks/account/use-account-names', () => ({
  useAccountDisplayName: () => ({ data: 'Account 1' }),
}));

vi.mock('@app/store/wallets/wallet.selectors', async importOriginal => ({
  ...(await importOriginal<typeof import('@app/store/wallets/wallet.selectors')>()),
  useWalletEntities: () => walletEntitiesMock(),
}));

vi.mock('@leather.io/ui', () => ({
  BulletSeparator({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
  },
  Caption({ children }: { children: React.ReactNode }) {
    return <span>{children}</span>;
  },
}));

vi.mock('@app/components/account/account-list-item.layout', () => ({
  AccountListItemLayout({
    accountName,
    accountAddresses,
  }: {
    accountName: React.ReactNode;
    accountAddresses: React.ReactNode;
  }) {
    return (
      <div>
        {accountName}
        {accountAddresses}
      </div>
    );
  },
}));

vi.mock('@app/components/account/account-name', () => ({
  AccountNameLayout({ children }: { children: React.ReactNode }) {
    return <span>{children}</span>;
  },
}));

vi.mock('@app/components/account/account-addresses', () => ({
  AccountAddresses: () => <span>addresses</span>,
}));

vi.mock('@app/components/account-total-balance', () => ({
  AccountTotalBalance: () => null,
}));

vi.mock('@app/ui/components/account/account-avatar/account-avatar-item', () => ({
  AccountAvatarItem: () => null,
}));

describe(CurrentAccountDisplayer.name, () => {
  beforeEach(() => {
    useCurrentPolicyMock.mockReturnValue(null);
  });

  test('renders the current account name and addresses', () => {
    walletEntitiesMock.mockReturnValue({ abc123: { name: 'Wallet 3' } });

    const html = renderToString(<CurrentAccountDisplayer onSelectAccount={() => null} />);

    expect(html).toContain('Account 1');
    expect(html).toContain('addresses');
  });

  test('does not render the wallet name in the account row', () => {
    walletEntitiesMock.mockReturnValue({ abc123: { name: 'Wallet 3' } });

    const html = renderToString(<CurrentAccountDisplayer onSelectAccount={() => null} />);

    expect(html).not.toContain('Wallet 3');
  });

  test('renders the policy account when a policy is active and policy accounts are allowed', () => {
    walletEntitiesMock.mockReturnValue({ abc123: { name: 'Wallet 3' } });
    useCurrentPolicyMock.mockReturnValue({
      id: 'abc123/0/mainnet',
      parentAccountId: 'abc123/0',
      networkId: 'mainnet',
      address: 'bc1qpolicyaddress',
      role: 'signer',
      chain: 'bitcoin',
      descriptor: 'wsh(...)',
    });

    const html = renderToString(
      <CurrentAccountDisplayer onSelectAccount={() => null} allowPolicyAccounts />
    );

    expect(html).toContain('Multisig 1234...5678');
    expect(html).not.toContain('Account 1');
    expect(html).not.toContain('addresses');
  });

  test('renders the singlesig parent when a policy is active but policy accounts are not allowed', () => {
    walletEntitiesMock.mockReturnValue({ abc123: { name: 'Wallet 3' } });
    useCurrentPolicyMock.mockReturnValue({
      id: 'abc123/0/mainnet',
      parentAccountId: 'abc123/0',
      networkId: 'mainnet',
      address: 'bc1qpolicyaddress',
      role: 'signer',
      chain: 'bitcoin',
      descriptor: 'wsh(...)',
    });

    const html = renderToString(<CurrentAccountDisplayer onSelectAccount={() => null} />);

    expect(html).toContain('Account 1');
    expect(html).toContain('addresses');
    expect(html).not.toContain('Multisig 1234...5678');
  });
});
