import { useCallback, useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router';

import { RouteUrls } from '@shared/route-urls';
import { closeWindow } from '@shared/utils';
import { analytics } from '@shared/utils/analytics';
import { logger } from '@shared/logger';

import {
  useHandleQueuedBackgroundAnalytics,
  useInitalizeAnalytics,
} from '@app/common/app-analytics';
import { ContainerLayout } from '@app/components/layout';
import { LoadingSpinner } from '@app/components/loading-spinner';
import {
  SwitchAccountSheet,
  type SwitchAccountSheetOpenDetails,
} from '@app/features/dialogs/switch-account-sheet/switch-account-sheet';
import { InAppMessages } from '@app/features/in-app-messages/in-app-messages';
import { useOnChangeAccount } from '@app/routes/hooks/use-on-change-account';
import { useOnSignOut } from '@app/routes/hooks/use-on-sign-out';
import { useOnWalletLock } from '@app/routes/hooks/use-on-wallet-lock';
import { useAppDispatch, useHasStateRehydrated } from '@app/store';
import { switchAccount } from '@app/store/chains/stx-chain.actions';

import { useSyncAddressMonitor } from '../address-monitor/use-sync-address-monitor';
import { useRestoreFormState } from '../popup-send-form-restoration/use-restore-form-state';

export function Container() {
  const { pathname: locationPathname } = useLocation();
  const pathname = locationPathname as RouteUrls;
  const [isShowingSwitchAccount, setIsShowingSwitchAccount] = useState(false);
  const accountSwitcherOpenStartTimeRef = useRef<number | null>(null);
  const dispatch = useAppDispatch();

  const hasStateRehydrated = useHasStateRehydrated();
  useSyncAddressMonitor();
  useOnWalletLock(() => closeWindow());
  useOnSignOut(() => closeWindow());
  useRestoreFormState();
  useInitalizeAnalytics();
  useHandleQueuedBackgroundAnalytics();
  useOnChangeAccount(index => dispatch(switchAccount(index)));

  useEffect(() => void analytics.page('view', `${pathname}`), [pathname]);

  useEffect(() => {
    if (!isShowingSwitchAccount) {
      accountSwitcherOpenStartTimeRef.current = null;
      return;
    }
    if (accountSwitcherOpenStartTimeRef.current !== null) return;

    const startTime = performance.now();
    accountSwitcherOpenStartTimeRef.current = startTime;
    logger.info('account-switcher: open requested', {
      route: pathname,
      startTimeMs: startTime,
    });
  }, [isShowingSwitchAccount, pathname]);

  const handleAccountSwitcherReady = useCallback(
    (details: SwitchAccountSheetOpenDetails) => {
      const endTime = performance.now();
      const startTime = accountSwitcherOpenStartTimeRef.current;
      const durationMs = typeof startTime === 'number' ? endTime - startTime : undefined;

      logger.info('account-switcher: open ready', {
        route: pathname,
        durationMs,
        startTimeMs: startTime,
        endTimeMs: endTime,
        ...details,
      });
    },
    [pathname]
  );

  if (!hasStateRehydrated) return <LoadingSpinner />;

  return (
    <>
      {isShowingSwitchAccount && (
        <SwitchAccountSheet
          isShowing={isShowingSwitchAccount}
          onClose={() => setIsShowingSwitchAccount(false)}
          onOpenReady={handleAccountSwitcherReady}
        />
      )}
      <InAppMessages />
      <ContainerLayout>
        <Outlet context={{ isShowingSwitchAccount, setIsShowingSwitchAccount }} />
      </ContainerLayout>
    </>
  );
}
