import { useRef } from 'react';

import { PageLayout } from '@/components/page/page.layout';
import { AccountsWidget } from '@/components/widgets/accounts/accounts-widget';
import { BalancesWidget } from '@/components/widgets/balances/balances-widget';
import { AllAccountBalances } from '@/features/balances/balances';
import { NotificationsSheet } from '@/features/notifications/notifications-sheet';
import { useOnDetectNoNotificationPreference } from '@/features/notifications/use-notifications';
import { AppRoutes } from '@/routes';
import { useWallets } from '@/store/wallets/wallets.read';
import { useLingui } from '@lingui/react';
import { router } from 'expo-router';

import { SheetRef } from '@leather.io/ui/native';

export function Home() {
  useLingui();
  const { hasWallets } = useWallets();
  const notificationSheetRef = useRef<SheetRef>(null);

  useOnDetectNoNotificationPreference(notificationSheetRef.current?.present);

  return (
    <PageLayout>
      <AccountsWidget />
      {hasWallets && (
        <BalancesWidget onPressHeader={() => router.navigate(AppRoutes.Balances)}>
          <AllAccountBalances />
        </BalancesWidget>
      )}
      <NotificationsSheet sheetRef={notificationSheetRef} />
    </PageLayout>
  );
}
