import { getAvatarIcon } from '@/components/avatar-icon';
import { Balance } from '@/components/balance/balance';
import { PageLayout } from '@/components/page/page.layout';
// import {
//   CollectiblesWidget,
//   mockCollectibles,
//   serializeCollectibles,
// } from '@/components/widgets/collectibles';
// import { TokensWidget } from '@/components/widgets/tokens';
import { MockedAccount } from '@/mocks/account.mocks';
import { mockTotalBalance } from '@/mocks/balance.mocks';

import { Money } from '@leather.io/models';

// import { getMockTokens } from '@/mocks/tokens.mocks';
import { AccountOverview } from './account-overview-card';

interface AccountLayoutProps {
  account: MockedAccount;
  balance: Money;
}

export function AccountLayout({ account, balance }: AccountLayoutProps) {
  return (
    <PageLayout>
      <AccountOverview
        Icon={getAvatarIcon(account.icon)}
        heading={<Balance balance={balance} variant="heading02" />}
        caption={account.name}
      />
      {/* TODO - re-enable widgets when real data available */}
      {/* <TokensWidget tokens={getMockTokens()} totalBalance={mockTotalBalance} />
      <CollectiblesWidget
        collectibles={serializeCollectibles(mockCollectibles)}
        totalBalance={mockTotalBalance}
      /> */}
    </PageLayout>
  );
}
