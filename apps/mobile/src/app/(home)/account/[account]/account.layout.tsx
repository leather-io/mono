import { getAvatarIcon } from '@/components/avatar-icon';
import { Balance } from '@/components/balance/balance';
import { PageLayout } from '@/components/page/page.layout';
// import {
//   CollectiblesWidget,
//   mockCollectibles,
//   serializeCollectibles,
// } from '@/components/widgets/collectibles';
import { type Token, TokensWidget } from '@/components/widgets/tokens';
import { Account } from '@/store/accounts/accounts';

// import { mockTotalBalance } from '@/mocks/balance.mocks';
import { Money } from '@leather.io/models';

import { AccountOverview } from './account-overview-card';

interface AccountLayoutProps {
  account: Account;
  balance: Money;
  tokens: Token[];
}

export function AccountLayout({ account, balance, tokens }: AccountLayoutProps) {
  return (
    <PageLayout>
      <AccountOverview
        Icon={getAvatarIcon(account.icon)}
        heading={<Balance balance={balance} variant="heading02" />}
        caption={account.name}
      />
      <TokensWidget tokens={tokens} totalBalance={balance} />
      {/* TODO - re-enable widgets when real data available */}
      {/* 
      <CollectiblesWidget
        collectibles={serializeCollectibles(mockCollectibles)}
        totalBalance={mockTotalBalance}
      /> */}
    </PageLayout>
  );
}
