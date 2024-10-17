import { PageLayout } from '@/components/page/page.layout';
import { AccountsWidget } from '@/components/widgets/accounts/accounts-widget';
import { MockedAccount } from '@/mocks/account.mocks';
// import {
//   CollectiblesWidget,
//   mockCollectibles,
//   serializeCollectibles,
// } from '@/components/widgets/collectibles';
// import { TokensWidget } from '@/components/widgets/tokens';
// import { mockTotalBalance } from '@/mocks/balance.mocks';
// import { getMockTokens } from '@/mocks/tokens.mocks';
import { useAccounts } from '@/store/accounts/accounts.read';
import { useWallets } from '@/store/wallets/wallets.read';
import { useLingui } from '@lingui/react';

export function Home() {
  useLingui();
  const wallets = useWallets();
  const accounts = useAccounts();

  return (
    <PageLayout>
      <AccountsWidget accounts={accounts.list as MockedAccount[]} wallets={wallets.list} />

      {/* TODO - re-enable widgets when real data available */}
      {/* <TokensWidget tokens={getMockTokens()} totalBalance={mockTotalBalance} />
      <CollectiblesWidget
        collectibles={serializeCollectibles(mockCollectibles)}
        totalBalance={mockTotalBalance}
      /> */}
    </PageLayout>
  );
}
