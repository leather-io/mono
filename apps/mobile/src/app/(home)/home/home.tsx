import { useRef } from 'react';

import { PageLayout } from '@/components/page/page.layout';
import { AccountsWidget } from '@/components/widgets/accounts/accounts-widget';
import { AllAccountBalances, TokensWidget } from '@/components/widgets/tokens/tokens-widget';
import { NotificationsSheet } from '@/features/notifications/notifications-sheet';
import { useOnDetectNoNotificationPreference } from '@/features/notifications/use-notifications';
import { useWallets } from '@/store/wallets/wallets.read';
import { useLingui } from '@lingui/react';

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
        <TokensWidget>
          <AllAccountBalances />
        </TokensWidget>
      )}
      <NotificationsSheet sheetRef={notificationSheetRef} />
    </PageLayout>
  );
}
