import { AccountsWidget } from '@/components/widgets/accounts/accounts-widget';
import {
  CollectiblesWidget,
  mockCollectibles,
  serializeCollectibles,
} from '@/components/widgets/collectibles';
import { TokensWidget, getMockTokens } from '@/components/widgets/tokens';
import { useAccounts } from '@/store/accounts/accounts.read';
import { useWallets } from '@/store/wallets/wallets.read';
import { useLingui } from '@lingui/react';

import { HomeLayout } from './home.layout';

const mockTotalBalance = {
  totalUsdBalance: '$126.74',
  totalBtcBalance: '0.00215005',
  totalStxBalance: '0.0024',
};

export function Home() {
  useLingui();
  const wallets = useWallets();
  const accounts = useAccounts();

  return (
    <HomeLayout>
      <AccountsWidget accounts={accounts.list} wallets={wallets.list} />
      <TokensWidget tokens={getMockTokens()} totalBalance={mockTotalBalance.totalUsdBalance} />
      <CollectiblesWidget
        collectibles={serializeCollectibles(mockCollectibles)}
        totalBalance={mockTotalBalance.totalUsdBalance}
      />
    </HomeLayout>
  );
}
