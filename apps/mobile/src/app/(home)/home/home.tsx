import { PageLayout } from '@/components/page/page.layout';
import { AccountsWidget } from '@/components/widgets/accounts/accounts-widget';
import { AllAccountBalances, TokensWidget } from '@/components/widgets/tokens/tokens-widget';
// import {
//   CollectiblesWidget,
//   mockCollectibles,
//   serializeCollectibles,
// } from '@/components/widgets/collectibles';
import { useAccounts } from '@/store/accounts/accounts.read';
import { useWallets } from '@/store/wallets/wallets.read';
import { useLingui } from '@lingui/react';

export function Home() {
  useLingui();
  const wallets = useWallets();
  const accounts = useAccounts();

  return (
    <PageLayout>
      <AccountsWidget accounts={accounts.list} wallets={wallets.list} />
      <TokensWidget>
        <AllAccountBalances />
      </TokensWidget>

      {/* <CollectiblesWidget
        collectibles={serializeCollectibles(mockCollectibles)}
        totalBalance={mockTotalBalance}
      /> */}
    </PageLayout>
  );
}
