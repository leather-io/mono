import { useRef } from 'react';

import { PageLayout } from '@/components/page/page.layout';
import { AccountsWidget } from '@/features/account/accounts-widget';
import { ActivityWidget } from '@/features/activity/activity-widget';
import { AllAccountBalances } from '@/features/balances/balances';
import { BalancesWidget } from '@/features/balances/balances-widget';
import { TotalBalance } from '@/features/balances/total-balance';
import { Collectibles, CollectiblesWidget, hasCollectibles } from '@/features/collectibles';
import { EarnWidget } from '@/features/earn/earn-widget';
import { useCollectiblesFlag } from '@/features/feature-flags';
import { NotificationsSheet } from '@/features/notifications/notifications-sheet';
import { useOnDetectNoNotificationPreference } from '@/features/notifications/use-notifications';
import { useTotalActivity } from '@/queries/activity/account-activity.query';
import { useTotalCollectibles } from '@/queries/collectibles/account-collectibles.query';
import { useWallets } from '@/store/wallets/wallets.read';
import { t } from '@lingui/macro';
import { useLingui } from '@lingui/react';
import { router } from 'expo-router';

import { Box, SheetRef } from '@leather.io/ui/native';

export default function HomeScreen() {
  useLingui();
  const { hasWallets } = useWallets();
  const notificationSheetRef = useRef<SheetRef>(null);
  const activity = useTotalActivity();
  const collectibles = useTotalCollectibles();
  const releaseCollectibles = useCollectiblesFlag();
  useOnDetectNoNotificationPreference(notificationSheetRef.current?.present);
  return (
    <PageLayout>
      <Box gap="8" mt="5">
        <AccountsWidget />
        {hasWallets && (
          <>
            <BalancesWidget
              onPressHeader={() => router.navigate('/balances')}
              balance={<TotalBalance color="ink.text-subdued" />}
              title={t({ id: 'balances.header_title', message: 'All tokens' })}
            >
              <AllAccountBalances mode="widget" />
            </BalancesWidget>
            <ActivityWidget
              activity={activity}
              onPressHeader={() => router.navigate('/activity')}
              title={t({ id: 'activity.header_title', message: 'All activity' })}
            />
            <EarnWidget />
            {releaseCollectibles && hasCollectibles(collectibles) && (
              <CollectiblesWidget
                onPressHeader={() => router.navigate('/collectibles')}
                title={t({ id: 'collectibles.header_title', message: 'All collectibles' })}
              >
                <Collectibles collectibles={collectibles} mode="widget" />
              </CollectiblesWidget>
            )}
          </>
        )}
      </Box>
      <NotificationsSheet sheetRef={notificationSheetRef} />
    </PageLayout>
  );
}
