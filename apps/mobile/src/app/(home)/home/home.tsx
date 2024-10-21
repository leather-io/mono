import { PageLayout } from '@/components/page/page.layout';
import { AccountsWidget } from '@/components/widgets/accounts/accounts-widget';
import { TokensWidget } from '@/components/widgets/tokens/tokens-widget';
import { useGetTokensList } from '@/components/widgets/tokens/use-get-tokens-list';
import { useTotalBalance } from '@/hooks/balances/use-total-balance';
import { useAccounts } from '@/store/accounts/accounts.read';
import { useWallets } from '@/store/wallets/wallets.read';
import { useLingui } from '@lingui/react';

export function Home() {
  useLingui();
  const wallets = useWallets();
  const accounts = useAccounts();

  const tokens = useGetTokensList(accounts.list);
  const { totalBalance } = useTotalBalance(accounts.list);

  return (
    <PageLayout>
      <AccountsWidget totalBalance={totalBalance} accounts={accounts.list} wallets={wallets.list} />
      <TokensWidget tokens={tokens} totalBalance={totalBalance} />
      {/* TODO - re-enable when real data available */}
      {/* 
      <CollectiblesWidget
        collectibles={serializeCollectibles(mockCollectibles)}
        totalBalance={mockTotalBalance}
      /> */}
    </PageLayout>
  );
}
