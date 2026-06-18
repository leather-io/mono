import { renderToString } from 'react-dom/server';

import { CurrentAccountDisplayer } from './current-account-displayer';

const currentAccountId = { fingerprint: 'abc123', accountIndex: 0 };

const walletEntitiesMock = vi.fn();

vi.mock('react-redux', () => ({
  useSelector: () => ({ fingerprint: 'abc123' }),
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
  test('renders the wallet name of the current account', () => {
    walletEntitiesMock.mockReturnValue({ abc123: { name: 'Wallet 3' } });

    const html = renderToString(<CurrentAccountDisplayer onSelectAccount={() => null} />);

    expect(html).toContain('Wallet 3');
    expect(html).toContain('Account 1');
  });

  test('omits the wallet name when the wallet has no entry', () => {
    walletEntitiesMock.mockReturnValue({});

    const html = renderToString(<CurrentAccountDisplayer onSelectAccount={() => null} />);

    expect(html).not.toContain('Wallet 3');
    expect(html).toContain('Account 1');
  });
});
