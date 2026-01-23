import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router';

import { Box } from 'leather-styles/jsx';

import { Button } from '@leather.io/ui';

import { RouteUrls } from '@shared/route-urls';
import { closeWindow } from '@shared/utils';
import { analytics } from '@shared/utils/analytics';

import { initalizeAnalytics, useHandleQueuedBackgroundAnalytics } from '@app/common/app-analytics';
import { ContainerLayout } from '@app/components/layout';
import { LoadingSpinner } from '@app/components/loading-spinner';
import { SwitchAccountSheet } from '@app/features/dialogs/switch-account-sheet/switch-account-sheet';
import { InAppMessages } from '@app/features/in-app-messages/in-app-messages';
import { useOnChangeAccount } from '@app/routes/hooks/use-on-change-account';
import { useOnSignOut } from '@app/routes/hooks/use-on-sign-out';
import { useOnWalletLock } from '@app/routes/hooks/use-on-wallet-lock';
import { useAppDispatch, useHasStateRehydrated } from '@app/store';
import { userSwitchesAccount } from '@app/store/active/active.slice';

import { useSyncAddressMonitor } from '../address-monitor/use-sync-address-monitor';
import { DeveloperUtilitiesSheet } from '../developer-utilities/developer-utilities-sheet';
import { useRestoreFormState } from '../popup-send-form-restoration/use-restore-form-state';

initalizeAnalytics();

export function Container() {
  const { pathname: locationPathname } = useLocation();
  const pathname = locationPathname as RouteUrls;
  const [isShowingSwitchAccount, setIsShowingSwitchAccount] = useState(false);
  const [isShowingDevUtilities, setIsShowingDevUtilities] = useState(false);
  const dispatch = useAppDispatch();
  const hasStateRehydrated = useHasStateRehydrated();
  useSyncAddressMonitor();
  useOnWalletLock(() => closeWindow());
  useOnSignOut(() => closeWindow());
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
      <InAppMessages />
      <ContainerLayout>
        <Outlet context={{ isShowingSwitchAccount, setIsShowingSwitchAccount }} />
      </ContainerLayout>

      <Box position="fixed" top="space.04" right="space.04" zIndex={9999}>
        <Button
          onClick={() => setIsShowingDevUtilities(true)}
          size="sm"
          variant="ghost"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            padding: 0,
            fontSize: '20px',
          }}
        >
          🛠️
        </Button>
      </Box>

      <DeveloperUtilitiesSheet
        isShowing={isShowingDevUtilities}
        onClose={() => setIsShowingDevUtilities(false)}
      />
    </>
  );
}
