import { renderToString } from 'react-dom/server';

import { createMoney } from '@leather.io/utils';

import { SigningAccountCard } from './signing-account-card';

const walletEntitiesMock = vi.fn();

vi.mock('@app/store/accounts/blockchain/stacks/stacks-account.hooks', () => ({
  useCurrentStacksAccount: () => ({
    fingerprint: 'abc123',
    accountIndex: 0,
    address: 'SP3W000',
    stxPublicKey: '',
  }),
}));

vi.mock('@app/common/hooks/account/use-account-names', () => ({
  useAccountDisplayName: () => ({ data: 'Account 1', isLoading: false }),
}));

vi.mock('@app/store/wallets/wallet.selectors', async importOriginal => ({
  ...(await importOriginal<typeof import('@app/store/wallets/wallet.selectors')>()),
  useWalletEntities: () => walletEntitiesMock(),
}));

vi.mock('@app/common/currency-formatter', () => ({
  formatCurrency: () => 'formatted-amount',
}));

vi.mock('@app/components/account/account-name', () => ({
  AccountNameLayout({ children }: { children: React.ReactNode }) {
    return <span>{children}</span>;
  },
}));

vi.mock('@app/ui/components/account/account-avatar/account-avatar-item', () => ({
  AccountAvatarItem: () => null,
}));

vi.mock('@leather.io/ui', () => {
  const Approver = {
    Section({ children }: { children: React.ReactNode }) {
      return <div>{children}</div>;
    },
    Subheader({ children }: { children: React.ReactNode }) {
      return <div>{children}</div>;
    },
  };
  return {
    Approver,
    Caption({ children }: { children: React.ReactNode }) {
      return <span>{children}</span>;
    },
    ItemLayout({
      titleLeft,
      captionLeft,
      titleRight,
      captionRight,
    }: {
      titleLeft: React.ReactNode;
      captionLeft: React.ReactNode;
      titleRight: React.ReactNode;
      captionRight: React.ReactNode;
    }) {
      return (
        <div>
          {titleLeft}
          {captionLeft}
          {titleRight}
          {captionRight}
        </div>
      );
    },
    SkeletonLoader({ children }: { children: React.ReactNode }) {
      return <div>{children}</div>;
    },
  };
});

function renderCard() {
  return renderToString(
    <SigningAccountCard
      address={<span>SP3W…TDE0</span>}
      availableBalance={createMoney(0, 'BTC')}
      fiatBalance={createMoney(0, 'USD')}
      isLoadingBalance={false}
    />
  );
}

describe(SigningAccountCard.name, () => {
  test('renders the account name under the "With account" subheader', () => {
    walletEntitiesMock.mockReturnValue({ abc123: { name: 'Wallet 3' } });

    const html = renderCard();

    expect(html).toContain('With account');
    expect(html).toContain('Account 1');
  });
});
