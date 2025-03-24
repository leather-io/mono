import { Balance } from '@/components/balance/balance';
import { PageLayout } from '@/components/page/page.layout';
import { BalancesWidget } from '@/components/widgets/balances/balances-widget';
import { AccountBalances } from '@/features/balances/balances';
import { useAccountAddresses } from '@/hooks/use-account-addresses';
import { useAccountActivityQuery } from '@/queries/activity/account-activity.query';
import { AppRoutes } from '@/routes';
import { Account } from '@/store/accounts/accounts';
import { router } from 'expo-router';

import { Money } from '@leather.io/models';

import { ActivityWidget } from '../../activity/components/activity-widget';
import { AccountOverview } from './account-overview-card';

interface AccountLayoutProps {
  account: Account;
  balance: Money;
}

export function AccountLayout({ account, balance }: AccountLayoutProps) {
  const accountAddresses = useAccountAddresses(account.fingerprint, account.accountIndex);
  const { data: activity, isLoading } = useAccountActivityQuery(accountAddresses);

  return (
    <PageLayout>
      <AccountOverview
        icon={account.icon}
        heading={<Balance balance={balance} variant="heading02" />}
        caption={account.name}
      />
      <BalancesWidget
        onPressHeader={() =>
          router.navigate({
            pathname: AppRoutes.AccountBalances,
            params: { accountId: account.id },
          })
        }
        totalBalance={balance}
      >
        <AccountBalances
          hardCap
          fingerprint={account.fingerprint}
          accountIndex={account.accountIndex}
        />
      </BalancesWidget>
      {activity && (
        <ActivityWidget
          activity={activity}
          isLoading={isLoading}
          onPressHeader={() =>
            router.navigate({
              pathname: AppRoutes.AccountActivity,
              params: { accountId: account.id, accountName: account.name },
            })
          }
        />
      )}
    </PageLayout>
  );
}
