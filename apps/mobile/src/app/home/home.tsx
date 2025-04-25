import { useRef } from 'react';

import { PageLayout } from '@/components/page/page.layout';
import { AccountsWidget } from '@/features/account/accounts-widget';
import { ActivityWidget } from '@/features/activity/activity-widget';
import { AllAccountBalances } from '@/features/balances/balances';
import { BalancesWidget } from '@/features/balances/balances-widget';
import { EmptyBalance } from '@/features/balances/token-balance';
import { Collectibles, CollectiblesWidget, hasCollectibles } from '@/features/collectibles';
import { useCollectiblesFlag } from '@/features/feature-flags';
import { NotificationsSheet } from '@/features/notifications/notifications-sheet';
import { useOnDetectNoNotificationPreference } from '@/features/notifications/use-notifications';
import { useTotalActivity } from '@/queries/activity/account-activity.query';
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
  const activity = useTotalActivity();
  const { totalBalance: aggregatedTotalBalance } = useTotalBalance();
  const collectibles = useTotalCollectibles();
  const releaseCollectibles = useCollectiblesFlag();
  useOnDetectNoNotificationPreference(notificationSheetRef.current?.present);

  const totalBalance =
    aggregatedTotalBalance.state === 'success' ? aggregatedTotalBalance.value : EmptyBalance;
  const isLoadingTotalBalance = aggregatedTotalBalance.state === 'loading';
  const isErrorTotalBalance = aggregatedTotalBalance.state === 'error';

  return (
    <PageLayout>
      <AccountsWidget
        totalBalance={totalBalance}
        isLoadingTotalBalance={isLoadingTotalBalance}
        fetchError={isErrorTotalBalance}
      />
      {hasWallets && (
        <>
          <BalancesWidget
            onPressHeader={() => router.navigate(AppRoutes.Balances)}
            totalBalance={totalBalance}
            isLoading={isLoadingTotalBalance}
          >
            <AllAccountBalances hardCap />
          </BalancesWidget>
          <ActivityWidget
            activity={activity}
            onPressHeader={() => router.navigate(AppRoutes.Activity)}
          />

          {releaseCollectibles && hasCollectibles(collectibles) && (
            <CollectiblesWidget onPressHeader={() => router.navigate(AppRoutes.Collectibles)}>
              <Collectibles collectibles={collectibles} mode="widget" />
            </CollectiblesWidget>
          )}
        </>
      )}
      <NotificationsSheet sheetRef={notificationSheetRef} />
    </PageLayout>
  );
}
