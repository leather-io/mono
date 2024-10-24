import { PageLayout } from '@/components/page/page.layout';
import { AccountsWidget } from '@/components/widgets/accounts/accounts-widget';
import { TokensWidget } from '@/components/widgets/tokens/tokens-widget';
import { useGetTokensList } from '@/components/widgets/tokens/use-get-tokens-list';
import { useTotalBalance } from '@/features/accounts/balances/hooks/use-total-balance';
import { useAccounts } from '@/store/accounts/accounts.read';
import { useWallets } from '@/store/wallets/wallets.read';
import { useLingui } from '@lingui/react';

export function Home() {
  useLingui();
  const wallets = useWallets();
  const accounts = useAccounts();

  const tokens = useGetTokensList(accounts.list);
  const { totalBalance } = useTotalBalance();

  console.log('totalBalance', totalBalance);
  return (
    <PageLayout>
      <AccountsWidget totalBalance={totalBalance} accounts={accounts.list} wallets={wallets.list} />
      {wallets.hasWallets && <TokensWidget tokens={tokens} totalBalance={totalBalance} />}
      {/* TODO - re-enable when real data available */}
      {/* 
      <CollectiblesWidget
        collectibles={serializeCollectibles(mockCollectibles)}
        totalBalance={mockTotalBalance}
      /> */}
    </PageLayout>
  );
}
