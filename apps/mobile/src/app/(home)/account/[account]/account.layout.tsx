import { Balance } from '@/components/balance/balance';
import { PageLayout } from '@/components/page/page.layout';
import { BalancesWidget } from '@/components/widgets/balances/balances-widget';
import { AccountBalances } from '@/features/balances/balances';
import { AppRoutes } from '@/routes';
import { Account } from '@/store/accounts/accounts';
import { router } from 'expo-router';

import { Money } from '@leather.io/models';

import { AccountOverview } from './account-overview-card';

interface AccountLayoutProps {
  account: Account;
  balance: Money;
}
export function AccountLayout({ account, balance }: AccountLayoutProps) {
  return (
    <PageLayout>
      <AccountOverview
        icon={account.icon}
        heading={<Balance balance={balance} variant="heading02" />}
        caption={account.name}
      />
      <BalancesWidget onPressHeader={() => router.navigate(AppRoutes.Balances)}>
        <AccountBalances fingerprint={account.fingerprint} accountIndex={account.accountIndex} />
      </BalancesWidget>
    </PageLayout>
  );
}
