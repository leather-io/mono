import { useEffect } from 'react';

import { useAppServices } from '@/app/app-services.context';
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
import { useAccounts } from '@/store/accounts/accounts.read';
import { useSettings } from '@/store/settings/settings';
import { useWallets } from '@/store/wallets/wallets.read';
import { useLingui } from '@lingui/react';

import { createMoney } from '@leather.io/utils';

export function Home() {
  useLingui();
  const wallets = useWallets();
  const accounts = useAccounts();
  const { getBtcBalanceService } = useAppServices();
  const { networkPreference } = useSettings();
  useEffect(() => {
    getBtcBalanceService()
      .getBtcBalance(
        'xpub6CxzM41aUbKigFCifZxs9wkX37SMm5qRFqYjk1VdUZtwK3a5YoNnqZuNe29xycKLLThEEXDaKLLhke2Kwi2xKhrj14mwCCyzBGChGcaJH9L'
      )
      .then(bal => {
        console.log('current balance: ' + bal.availableBalance.amount);
      });
    getBtcBalanceService('testnet')
      .getBtcBalance(
        'xpub6CxzM41aUbKigFCifZxs9wkX37SMm5qRFqYjk1VdUZtwK3a5YoNnqZuNe29xycKLLThEEXDaKLLhke2Kwi2xKhrj14mwCCyzBGChGcaJH9L'
      )
      .then(bal => {
        console.log('testnet balance: ' + bal.availableBalance.amount);
      });
  }, [networkPreference.id]);

  return (
    <PageLayout>
      <AccountsWidget accounts={accounts.list} wallets={wallets.list} />
      <TokensWidget tokens={getMockTokens()} totalBalance={createMoney(0, 'USD')} />
      <CollectiblesWidget
        collectibles={serializeCollectibles(mockCollectibles)}
        totalBalance={mockTotalBalance}
      />
    </PageLayout>
  );
}
