import { useRef } from 'react';

import { ActivityWidget } from '@/app/(home)/activity/components/activity-widget';
import { PageLayout } from '@/components/page/page.layout';
import { AccountsWidget } from '@/components/widgets/accounts/accounts-widget';
import { BalancesWidget } from '@/components/widgets/balances/balances-widget';
import { CollectiblesWidget } from '@/components/widgets/collectibles/collectibles-widget';
import { AllAccountBalances } from '@/features/balances/balances';
import { NotificationsSheet } from '@/features/notifications/notifications-sheet';
import { useOnDetectNoNotificationPreference } from '@/features/notifications/use-notifications';
import { useTotalAccountAddresses } from '@/hooks/use-account-addresses';
import { useTotalActivityQuery } from '@/queries/activity/account-activity.query';
import { useTotalBalance } from '@/queries/balance/total-balance.query';
import { useTotalCollectibles } from '@/queries/collectibles/account-collectibles.query';
import { AppRoutes } from '@/routes';
import { useWallets } from '@/store/wallets/wallets.read';
import { useLingui } from '@lingui/react';
import { router } from 'expo-router';

import { SheetRef } from '@leather.io/ui/native';

export function Home() {
  useLingui();
  const { hasWallets } = useWallets();
  const notificationSheetRef = useRef<SheetRef>(null);

  const accounts = useTotalAccountAddresses();
  const { data: activity, isLoading } = useTotalActivityQuery(accounts);
  const { totalBalance } = useTotalBalance();
  const collectibles = useTotalCollectibles();
  useOnDetectNoNotificationPreference(notificationSheetRef.current?.present);
  // TODO LEA-1726: Handle loading and error states
  if (totalBalance.state !== 'success') return;

  return (
    <PageLayout>
      <AccountsWidget />
      {hasWallets && (
        <BalancesWidget
          onPressHeader={() => router.navigate(AppRoutes.Balances)}
          totalBalance={totalBalance.value}
        >
          <AllAccountBalances hardCap />
        </BalancesWidget>
      )}
      {activity && (
        <ActivityWidget
          activity={activity}
          isLoading={isLoading}
          onPressHeader={() => router.navigate(AppRoutes.Activity)}
        />
      )}
      {collectibles && (
        <CollectiblesWidget
          collectibles={collectibles}
          onPressHeader={() => router.navigate(AppRoutes.Collectibles)}
        />
      )}
      <NotificationsSheet sheetRef={notificationSheetRef} />
    </PageLayout>
  );
}
