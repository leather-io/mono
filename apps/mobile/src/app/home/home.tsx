import { useRef } from 'react';

import { PageLayout } from '@/components/page/page.layout';
import { AccountsWidget } from '@/features/account/accounts-widget';
import { ActivityWidget } from '@/features/activity/activity-widget';
import { AllAccountBalances } from '@/features/balances/balances';
import { BalancesWidget } from '@/features/balances/balances-widget';
import { TotalBalance } from '@/features/balances/total-balance';
import { Collectibles, CollectiblesWidget, hasCollectibles } from '@/features/collectibles';
import { EarnWidget } from '@/features/earn/earn-widget';
import { useCollectiblesFlag, useEarnFlag } from '@/features/feature-flags';
import { NotificationsSheet } from '@/features/notifications/notifications-sheet';
import { useOnDetectNoNotificationPreference } from '@/features/notifications/use-notifications';
import { useTotalActivity } from '@/queries/activity/account-activity.query';
import { useTotalCollectibles } from '@/queries/collectibles/account-collectibles.query';
import { AppRoutes } from '@/routes';
import { useWallets } from '@/store/wallets/wallets.read';
import { t } from '@lingui/macro';
import { useLingui } from '@lingui/react';
import { router } from 'expo-router';

import { SheetRef } from '@leather.io/ui/native';

export function Home() {
  useLingui();
  const { hasWallets } = useWallets();
  const notificationSheetRef = useRef<SheetRef>(null);
  const activity = useTotalActivity();
  const collectibles = useTotalCollectibles();
  const releaseCollectibles = useCollectiblesFlag();
  const releaseEarn = useEarnFlag();
  useOnDetectNoNotificationPreference(notificationSheetRef.current?.present);

  return (
    <PageLayout>
      <AccountsWidget />
      {hasWallets && (
        <>
          <BalancesWidget
            onPressHeader={() => router.navigate(AppRoutes.Balances)}
            balance={<TotalBalance color="ink.text-subdued" />}
            title={t({ id: 'balances.header_title', message: 'All tokens' })}
          >
            <AllAccountBalances mode="widget" />
          </BalancesWidget>
          <ActivityWidget
            activity={activity}
            onPressHeader={() => router.navigate(AppRoutes.Activity)}
            title={t({ id: 'activity.header_title', message: 'All activity' })}
          />
          {releaseEarn && <EarnWidget />}
          {releaseCollectibles && hasCollectibles(collectibles) && (
            <CollectiblesWidget
              onPressHeader={() => router.navigate(AppRoutes.Collectibles)}
              title={t({ id: 'collectibles.header_title', message: 'All collectibles' })}
            >
              <Collectibles collectibles={collectibles} mode="widget" />
            </CollectiblesWidget>
          )}
        </>
      )}
      <NotificationsSheet sheetRef={notificationSheetRef} />
    </PageLayout>
  );
}
