import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router';

import { RouteUrls } from '@shared/route-urls';
import { persistDirtyTracker } from '@shared/storage/dirty-slice-tracker';
import { analytics } from '@shared/utils/analytics';

import { initalizeAnalytics, useHandleQueuedBackgroundAnalytics } from '@app/common/app-analytics';
import { useProbeNextAccountForActivity } from '@app/common/hooks/account/use-probe-next-account-for-activity';
import type { ReceiveView } from '@app/common/receive/receive';
import { ContainerLayout } from '@app/components/layout';
import { LoadingSpinner } from '@app/components/loading-spinner';
import { SwitchAccountSheet } from '@app/features/dialogs/switch-account-sheet/switch-account-sheet';
import { InAppMessages } from '@app/features/in-app-messages/in-app-messages';
import { ReceiveDialog } from '@app/pages/receive/receive-dialog';
import { useOnSignOut } from '@app/routes/hooks/use-on-sign-out';
import { useOnWalletListChanged } from '@app/routes/hooks/use-on-wallet-list-changed';
import { useOnWalletLock } from '@app/routes/hooks/use-on-wallet-lock';
import { persistor, useAppDispatch, useHasStateRehydrated } from '@app/store';
import { applyRemoteWalletRemoval } from '@app/store/active/active.actions';
import * as inMemoryStore from '@app/store/in-memory-key/in-memory-storage';
import { clearKeychainSelectorCaches } from '@app/store/in-memory-key/keychain-selector-cache';

import { useSyncAddressMonitor } from '../address-monitor/use-sync-address-monitor';
import { useRestoreFormState } from '../popup-send-form-restoration/use-restore-form-state';

initalizeAnalytics();

export function Container() {
  const { pathname: locationPathname } = useLocation();
  const pathname = locationPathname as RouteUrls;
  const [isShowingSwitchAccount, setIsShowingSwitchAccount] = useState(false);
  const [allowPolicyAccounts, setAllowPolicyAccounts] = useState(true);
  const [receiveView, setReceiveView] = useState<ReceiveView | null>(null);

  const dispatch = useAppDispatch();
  const hasStateRehydrated = useHasStateRehydrated();
  useProbeNextAccountForActivity(hasStateRehydrated);
  useSyncAddressMonitor();
  useOnWalletLock(() => {
    inMemoryStore.clearAll();
    clearKeychainSelectorCaches();
    window.location.reload();
  });
  useOnSignOut(() => {
    persistor.pause();
    persistDirtyTracker.suspendWrites();
    inMemoryStore.clearAll();
    clearKeychainSelectorCaches();
    window.location.reload();
  });
  useOnWalletListChanged(({ removedFingerprint }) => {
    if (removedFingerprint) {
      inMemoryStore.removeKey(removedFingerprint);
      clearKeychainSelectorCaches();
      void dispatch(applyRemoteWalletRemoval(removedFingerprint));
      return;
    }
    persistor.pause();
    persistDirtyTracker.suspendWrites();
    window.location.reload();
  });
  useRestoreFormState();
  useHandleQueuedBackgroundAnalytics();

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
          allowPolicyAccounts={allowPolicyAccounts}
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
            allowPolicyAccounts,
            setAllowPolicyAccounts,
            receiveView,
            setReceiveView,
          }}
        />
      </ContainerLayout>
    </>
  );
}
