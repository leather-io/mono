import { Balance } from '@/components/balance/balance';
import { PageLayout } from '@/components/page/page.layout';
import { AccountBalances, TokensWidget } from '@/components/widgets/tokens/tokens-widget';
import { Account } from '@/store/accounts/accounts';

import { Money } from '@leather.io/models';

import { TokenOverview } from './token-overview-card';

interface TokenLayoutProps {
  account: Account;
  balance: Money;
}
export function TokenLayout({ account, balance }: TokenLayoutProps) {
  return (
    <PageLayout>
      <TokenOverview
        icon={account.icon}
        heading={<Balance balance={balance} variant="heading02" />}
        caption={account.name}
      />
      <TokensWidget>
        <AccountBalances fingerprint={account.fingerprint} accountIndex={account.accountIndex} />
      </TokensWidget>
    </PageLayout>
  );
}
