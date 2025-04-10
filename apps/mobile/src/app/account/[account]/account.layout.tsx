import { Balance } from '@/components/balance/balance';
import { NakedHeader } from '@/components/headers/naked-header';
import { PageLayout } from '@/components/page/page.layout';
import { BalancesWidget } from '@/components/widgets/balances/balances-widget';
import { CollectiblesWidget } from '@/components/widgets/collectibles/collectibles-widget';
import { AccountBalances } from '@/features/balances/balances';
import { useCollectiblesFlag } from '@/features/feature-flags';
import { useAccountAddresses } from '@/hooks/use-account-addresses';
import { useAccountActivityQuery } from '@/queries/activity/account-activity.query';
import { useAccountCollectibles } from '@/queries/collectibles/account-collectibles.query';
import { AppRoutes } from '@/routes';
import { Account } from '@/store/accounts/accounts';
import { router } from 'expo-router';

import { Money } from '@leather.io/models';
import { SettingsGearIcon } from '@leather.io/ui/native';

import { ActivityWidget } from '../../activity/components/activity-widget';
import { AccountOverview } from './account-overview-card';

interface AccountLayoutProps {
  account: Account;
  balance: Money;
}

export function AccountLayout({ account, balance }: AccountLayoutProps) {
  const accountAddresses = useAccountAddresses(account.fingerprint, account.accountIndex);
  const { data: activity, isLoading } = useAccountActivityQuery(accountAddresses);
  const collectibles = useAccountCollectibles(account.fingerprint, account.accountIndex);
  const releaseCollectibles = useCollectiblesFlag();
  return (
    <PageLayout>
      <NakedHeader
        rightElement={
          <SettingsGearIcon
            onPress={() => {
              router.navigate({
                pathname: AppRoutes.SettingsWalletConfigureAccount,
                params: {
                  fingerprint: account.fingerprint,
                  account: account.accountIndex,
                },
              });
            }}
          />
        }
      />
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

      {collectibles && releaseCollectibles && (
        <CollectiblesWidget
          collectibles={collectibles}
          onPressHeader={() =>
            router.navigate({
              pathname: AppRoutes.AccountCollectibles,
              params: { accountId: account.id, accountName: account.name },
            })
          }
        />
      )}
    </PageLayout>
  );
}
