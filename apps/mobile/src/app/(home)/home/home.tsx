import { PageLayout } from '@/components/page/page.layout';
import { AccountsWidget } from '@/components/widgets/accounts/accounts-widget';
import {
  CollectiblesWidget,
  mockCollectibles,
  serializeCollectibles,
} from '@/components/widgets/collectibles';
import { TokensWidget } from '@/components/widgets/tokens';
import { mockTotalBalance } from '@/mocks/balance.mocks';
import { getMockTokens } from '@/mocks/tokens.mocks';
import { useBitcoinCompositeBalanceQuery } from '@/queries/balance/bitcoin-balance.query';
import { useAccounts } from '@/store/accounts/accounts.read';
import { useWallets } from '@/store/wallets/wallets.read';
import { useLingui } from '@lingui/react';

export function Home() {
  useLingui();
  const wallets = useWallets();
  const accounts = useAccounts();
  const { data: bitcoinBalance, isLoading } = useBitcoinCompositeBalanceQuery();
  // eslint-disable-next-line no-console, lingui/no-unlocalized-strings
  console.log(`BALANCE${isLoading ? ' is Loading' : ': ' + JSON.stringify(bitcoinBalance)}`);

  return (
    <PageLayout>
      <AccountsWidget accounts={accounts.list} wallets={wallets.list} />
      <TokensWidget tokens={getMockTokens()} totalBalance={bitcoinBalance?.availableBalance!} />
      <CollectiblesWidget
        collectibles={serializeCollectibles(mockCollectibles)}
        totalBalance={mockTotalBalance}
      />
    </PageLayout>
  );
}
