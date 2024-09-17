import { AccountsWidget } from '@/components/widgets/accounts/accounts-widget';
import { CollectiblesWidget } from '@/components/widgets/collectibles/collectibles-widget';
import { mockCollectibles } from '@/components/widgets/collectibles/collectibles.mocks';
import { TokensWidget } from '@/components/widgets/tokens/tokens-widget';
import { getMockTokens, mockTotalBalance } from '@/components/widgets/tokens/tokens.mocks';
import { useAccounts } from '@/store/accounts/accounts.read';
import { useWallets } from '@/store/wallets/wallets.read';
import { useLingui } from '@lingui/react';

import { HomeLayout } from './home.layout';

export function Home() {
  useLingui();
  const wallets = useWallets();
  const accounts = useAccounts();

  return (
    <HomeLayout>
      <AccountsWidget accounts={accounts.list} wallets={wallets.list} />
      <TokensWidget tokens={getMockTokens()} totalBalance={mockTotalBalance.totalUsdBalance} />
      <CollectiblesWidget
        collectibles={mockCollectibles}
        totalBalance={mockTotalBalance.totalUsdBalance}
      />
    </HomeLayout>
  );
}
