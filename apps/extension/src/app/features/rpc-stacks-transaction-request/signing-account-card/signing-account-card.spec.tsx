import { renderToString } from 'react-dom/server';

import { createMoney } from '@leather.io/utils';

import { SigningAccountCard } from './signing-account-card';

const walletEntitiesMock = vi.fn();
const currentPolicyMock = vi.fn();
const policyDisplayNameMock = vi.fn();

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

vi.mock('@app/store/policy/policy.selectors', () => ({
  useCurrentPolicy: () => currentPolicyMock(),
  usePolicyDisplayName: () => policyDisplayNameMock(),
}));

vi.mock('@app/store/policy/policy-store.utils', () => ({
  parsePolicyParent: () => ({ fingerprint: 'abc123', accountIndex: 1 }),
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

function renderCard(showPolicyAccount = false) {
  return renderToString(
    <SigningAccountCard
      address={<span>SP3W…TDE0</span>}
      availableBalance={createMoney(0, 'BTC')}
      fiatBalance={createMoney(0, 'USD')}
      isLoadingBalance={false}
      showPolicyAccount={showPolicyAccount}
    />
  );
}

describe(SigningAccountCard.name, () => {
  beforeEach(() => {
    currentPolicyMock.mockReturnValue(null);
    policyDisplayNameMock.mockReturnValue(null);
  });

  test('renders the account name under the "With account" subheader', () => {
    walletEntitiesMock.mockReturnValue({ abc123: { name: 'Wallet 3' } });

    const html = renderCard();

    expect(html).toContain('With account');
    expect(html).toContain('Account 1');
  });

  test('shows both the multisig and the signer when a policy is active and shown', () => {
    walletEntitiesMock.mockReturnValue({ abc123: { name: 'Wallet 3' } });
    currentPolicyMock.mockReturnValue({
      id: 'abc123/1/mainnet',
      chain: 'stacks',
      parentAccountId: 'abc123/1',
      address: 'SM3KJBA4RZ7Z20KD2HBXNSXVPCR1D3CRAV6Q05MKN',
    });
    policyDisplayNameMock.mockReturnValue('Family vault');

    const html = renderCard(true);

    // Transacting with account -> the multisig
    expect(html).toContain('Transacting with account');
    expect(html).toContain('Family vault');
    expect(html).toContain('SM3K…5MKN');

    // Signing with account -> the single-sig signer
    expect(html).toContain('Signing with account');
    expect(html).toContain('Account 1');
    expect(html).toContain('SP3W…TDE0');
  });

  test('shows only the single-sig account when a policy is active but not shown', () => {
    walletEntitiesMock.mockReturnValue({ abc123: { name: 'Wallet 3' } });
    currentPolicyMock.mockReturnValue({
      id: 'abc123/1/mainnet',
      chain: 'stacks',
      parentAccountId: 'abc123/1',
      address: 'SM3KJBA4RZ7Z20KD2HBXNSXVPCR1D3CRAV6Q05MKN',
    });
    policyDisplayNameMock.mockReturnValue('Family vault');

    const html = renderCard();

    expect(html).toContain('With account');
    expect(html).not.toContain('Transacting with account');
    expect(html).not.toContain('Family vault');
  });
});
