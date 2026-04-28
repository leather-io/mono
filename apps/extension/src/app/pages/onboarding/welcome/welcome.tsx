import { useCallback, useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router';

import { RouteUrls } from '@shared/route-urls';
import { closeWindow } from '@shared/utils';
import { analytics } from '@shared/utils/analytics';

import { doesBrowserSupportWebUsbApi, isPopupMode, whenPageMode } from '@app/common/utils';
import { openIndexPageInNewTab } from '@app/common/utils/open-in-new-tab';

import { WelcomeLayout } from './welcome.layout';

export function WelcomePage() {
  const navigate = useNavigate();

  const [isGeneratingWallet, setIsGeneratingWallet] = useState(false);

  const startOnboarding = useCallback(async () => {
    if (isPopupMode()) {
      void openIndexPageInNewTab(RouteUrls.Onboarding);
      closeWindow();
      return;
    }
    setIsGeneratingWallet(true);
    analytics.track('generate_new_secret_key');

    return navigate(RouteUrls.BackUpSecretKey);
  }, [navigate]);

  useEffect(() => {
    return () => setIsGeneratingWallet(false);
  }, []);

  function pageModeRoutingAction(url: string) {
    return whenPageMode({
      full() {
        return navigate(url);
      },
      popup() {
        void openIndexPageInNewTab(url);
        closeWindow();
      },
    });
  }

  const supportsWebUsbAction = pageModeRoutingAction(
    RouteUrls.Onboarding + '/' + RouteUrls.ConnectLedgerStart
  );
  const doesNotSupportWebUsbAction = pageModeRoutingAction(
    RouteUrls.Onboarding + '/' + RouteUrls.LedgerUnsupportedBrowser
  );

  const restoreWallet = pageModeRoutingAction(RouteUrls.SignIn);

  const onSelectConnectLedger = useCallback(async () => {
    if (doesBrowserSupportWebUsbApi()) {
      return supportsWebUsbAction();
    } else {
      return doesNotSupportWebUsbAction();
    }
  }, [doesNotSupportWebUsbAction, supportsWebUsbAction]);

  return (
    <>
      <WelcomeLayout
        isGeneratingWallet={isGeneratingWallet}
        onSelectConnectLedger={onSelectConnectLedger}
        onStartOnboarding={() => startOnboarding()}
        onRestoreWallet={() => restoreWallet()}
      />
      <Outlet />
    </>
  );
}
