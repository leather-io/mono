import { renderToString } from 'react-dom/server';

import { PopupHeader } from './popup.header';

const walletEntitiesMock = vi.fn();

vi.mock('@app/common/switch-account/use-switch-account-sheet-context', () => ({
  useSwitchAccountSheet: () => ({
    isShowingSwitchAccount: false,
    setIsShowingSwitchAccount: () => null,
  }),
}));

vi.mock('@app/store/accounts/account', () => ({
  useCurrentAccountId: () => ({ fingerprint: 'abc123', accountIndex: 0 }),
}));

vi.mock('@app/store/wallets/wallet.selectors', async importOriginal => ({
  ...(await importOriginal<typeof import('@app/store/wallets/wallet.selectors')>()),
  useWalletEntities: () => walletEntitiesMock(),
}));

vi.mock('@app/features/current-account/current-account-avatar', () => ({
  CurrentAccountAvatar: () => null,
}));

vi.mock('@app/features/current-account/current-account-name', () => ({
  CurrentAccountName: () => <span>Account 1</span>,
}));

vi.mock('@app/features/total-balance/total-balance', () => ({
  TotalBalance: () => null,
}));

vi.mock('@app/components/layout/headers/header', () => ({
  Header({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>;
  },
}));

vi.mock('@app/components/layout/headers/header-grid', () => ({
  HeaderGrid({ leftCol, rightCol }: { leftCol: React.ReactNode; rightCol: React.ReactNode }) {
    return (
      <div>
        {leftCol}
        {rightCol}
      </div>
    );
  },
  HeaderGridRightCol({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>;
  },
}));

vi.mock('@leather.io/ui', () => ({
  Flag({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>;
  },
  Logo: () => null,
  Caption({ children }: { children: React.ReactNode }) {
    return <span>{children}</span>;
  },
}));

describe(PopupHeader.name, () => {
  test('renders the wallet name under the account when showing the account switcher', () => {
    walletEntitiesMock.mockReturnValue({ abc123: { name: 'Wallet 3' } });

    const html = renderToString(<PopupHeader showSwitchAccount />);

    expect(html).toContain('Wallet 3');
    expect(html).toContain('Account 1');
  });

  test('does not render the account or wallet name when the switcher is hidden', () => {
    walletEntitiesMock.mockReturnValue({ abc123: { name: 'Wallet 3' } });

    const html = renderToString(<PopupHeader />);

    expect(html).not.toContain('Wallet 3');
    expect(html).not.toContain('Account 1');
  });
});
