import { AvatarIcon } from '@/components/avatar-icon';
import { Balance } from '@/components/balance/balance';
import { PageLayout } from '@/components/page/page.layout';
import { AccountBalances, TokensWidget } from '@/components/widgets/tokens/tokens-widget';
import { Account } from '@/store/accounts/accounts';
import { useTheme } from '@shopify/restyle';

import { Money } from '@leather.io/models';
import { Theme } from '@leather.io/ui/native';

import { AccountOverview } from './account-overview-card';

interface AccountLayoutProps {
  account: Account;
  balance: Money;
}
export function AccountLayout({ account, balance }: AccountLayoutProps) {
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
        heading={<Balance balance={balance} variant="heading02" />}
        caption={account.name}
      />
      <TokensWidget>
        <AccountBalances fingerprint={account.fingerprint} accountIndex={account.accountIndex} />
      </TokensWidget>
    </PageLayout>
  );
}
