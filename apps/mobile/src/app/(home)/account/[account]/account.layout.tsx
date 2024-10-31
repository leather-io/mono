import { AvatarIcon } from '@/components/avatar-icon';
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
import { useTheme } from '@shopify/restyle';

import { Theme } from '@leather.io/ui/native';

import { AccountOverview } from './account-overview-card';

interface AccountLayoutProps {
  account: MockedAccount;
}
export function AccountLayout({ account }: AccountLayoutProps) {
  const theme = useTheme<Theme>();
  return (
    <PageLayout>
      <AccountOverview
        icon={
          <AvatarIcon
            color={theme.colors['ink.background-primary']}
            icon={account.icon}
            width={40}
            height={40}
          />
        }
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
