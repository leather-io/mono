import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router';

import { RouteUrls } from '@shared/route-urls';
import { closeWindow } from '@shared/utils';
import { analytics } from '@shared/utils/analytics';

import { initalizeAnalytics, useHandleQueuedBackgroundAnalytics } from '@app/common/app-analytics';
import type { ReceiveView } from '@app/common/receive/receive';
import { ContainerLayout } from '@app/components/layout';
import { LoadingSpinner } from '@app/components/loading-spinner';
import { SwitchAccountSheet } from '@app/features/dialogs/switch-account-sheet/switch-account-sheet';
import { InAppMessages } from '@app/features/in-app-messages/in-app-messages';
import { ReceiveDialog } from '@app/pages/receive/receive-dialog';
import { useOnChangeAccount } from '@app/routes/hooks/use-on-change-account';
import { useOnSignOut } from '@app/routes/hooks/use-on-sign-out';
import { useOnWalletLock } from '@app/routes/hooks/use-on-wallet-lock';
import { useAppDispatch, useHasStateRehydrated } from '@app/store';
import { userSwitchesAccount } from '@app/store/active/active.slice';
import * as inMemoryStore from '@app/store/in-memory-key/in-memory-storage';

import { useSyncAddressMonitor } from '../address-monitor/use-sync-address-monitor';
import { useRestoreFormState } from '../popup-send-form-restoration/use-restore-form-state';

initalizeAnalytics();

export function Container() {
  const { pathname: locationPathname } = useLocation();
  const pathname = locationPathname as RouteUrls;
  const [isShowingSwitchAccount, setIsShowingSwitchAccount] = useState(false);
  const [receiveView, setReceiveView] = useState<ReceiveView | null>(null);

  const dispatch = useAppDispatch();
  const hasStateRehydrated = useHasStateRehydrated();
  useSyncAddressMonitor();
  useOnWalletLock(() => {
    inMemoryStore.clearAll();
    window.location.reload();
  });
  useOnSignOut(() => {
    inMemoryStore.clearAll();
    window.location.reload();
  });
  useRestoreFormState();
  useHandleQueuedBackgroundAnalytics();
  useOnChangeAccount(accountId => dispatch(userSwitchesAccount(accountId)));

  useEffect(() => {
    analytics.page('view', `${pathname}`);
  }, [pathname]);

  if (!hasStateRehydrated) return <LoadingSpinner />;

  return (
    <>
      {isShowingSwitchAccount && (
        <SwitchAccountSheet
          isShowing={isShowingSwitchAccount}
          onClose={() => setIsShowingSwitchAccount(false)}
        />
      )}
      {receiveView && (
        <ReceiveDialog
          view={receiveView}
          onChangeView={setReceiveView}
          onClose={() => setReceiveView(null)}
        />
      )}
      <InAppMessages />
      <ContainerLayout>
        <Outlet
          context={{
            isShowingSwitchAccount,
            setIsShowingSwitchAccount,
            receiveView,
            setReceiveView,
          }}
        />
      </ContainerLayout>
    </>
  );
}
