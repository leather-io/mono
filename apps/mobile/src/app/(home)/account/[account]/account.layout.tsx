import { getAvatarIcon } from '@/components/avatar-icon';
import { Balance } from '@/components/balance/balance';
import { PageLayout } from '@/components/page/page.layout';
import {
  CollectiblesWidget,
  mockCollectibles,
  serializeCollectibles,
} from '@/components/widgets/collectibles';
import { AccountBalances, TokensWidget } from '@/components/widgets/tokens/tokens-widget';
import { MockedAccount } from '@/mocks/account.mocks';
import { mockTotalBalance } from '@/mocks/balance.mocks';

import { AccountOverview } from './account-overview-card';

interface AccountLayoutProps {
  account: MockedAccount;
}
export function AccountLayout({ account }: AccountLayoutProps) {
  return (
    <PageLayout>
      <AccountOverview
        Icon={getAvatarIcon(account.icon)}
        heading={<Balance balance={mockTotalBalance} variant="heading02" />}
        caption={account.name}
      />
      <TokensWidget>
        <AccountBalances fingerprint={account.fingerprint} accountIndex={account.accountIndex} />
      </TokensWidget>
      <CollectiblesWidget
        collectibles={serializeCollectibles(mockCollectibles)}
        totalBalance={mockTotalBalance}
      />
    </PageLayout>
  );
}
