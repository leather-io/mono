import { PageLayout } from '@/components/page/page.layout';
import { AccountsWidget } from '@/components/widgets/accounts/accounts-widget';
import { AllAccountBalances, TokensWidget } from '@/components/widgets/tokens/tokens-widget';
import { useWalletTotalBalance } from '@/queries/balance/use-total-balance';
import { useAccounts } from '@/store/accounts/accounts.read';
import { useWallets } from '@/store/wallets/wallets.read';
import { useLingui } from '@lingui/react';

export function Home() {
  useLingui();
  const wallets = useWallets();
  const accounts = useAccounts();

  const { totalBalance } = useWalletTotalBalance();

  return (
    <PageLayout>
      <AccountsWidget totalBalance={totalBalance} accounts={accounts.list} wallets={wallets.list} />
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
