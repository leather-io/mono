import { AccountWidget } from '@/components/widgets/account/account-widget';
import { TokenWidget } from '@/components/widgets/tokens/token-widget';
import { getMockTokens, mockTotalBalance } from '@/components/widgets/tokens/tokens.mocks';
import { useAccounts } from '@/store/accounts/accounts.read';
import { useWallets } from '@/store/wallets/wallets.read';
import { useLingui } from '@lingui/react';

import { HomeLayout } from './home.layout';

export function Home() {
  useLingui();
  const wallets = useWallets();
  const accounts = useAccounts();

  // PETE just start loading balance with useGetBitcoinBalanceByAddress

  // also load useTotalBalance from extension/src/app/common/hooks/balance/use-total-balance.tsx for account widget

  // maybe hardcode my wallet address's so I can get it all working?
  return (
    <HomeLayout>
      <AccountWidget accounts={accounts.list} wallets={wallets.list} />
      <TokenWidget tokens={getMockTokens()} totalBalance={mockTotalBalance.totalUsdBalance} />
    </HomeLayout>
  );
}
