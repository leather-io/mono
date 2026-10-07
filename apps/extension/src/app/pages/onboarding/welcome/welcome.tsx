import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { RouteUrls } from '@shared/route-urls';
import { closeWindow } from '@shared/utils';
import { analytics } from '@shared/utils/analytics';

import { doesBrowserSupportWebHidApi, isPopupMode, whenPageMode } from '@app/common/utils';
import { openIndexPageInNewTab } from '@app/common/utils/open-in-new-tab';
import { handOffLedgerFlowToFullPage } from '@app/features/ledger/flow/ledger-flow-handoff';
import { useLedgerFlow } from '@app/features/ledger/flow/ledger-flow.context';
import type { LedgerFlowHandoffRequest } from '@app/features/ledger/flow/ledger-flow.types';

import { WelcomeLayout } from './welcome.layout';

export function WelcomePage() {
  const navigate = useNavigate();
  const { open: openLedgerFlow } = useLedgerFlow();

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

  const restoreWallet = pageModeRoutingAction(RouteUrls.SignIn);

  const onSelectConnectLedger = useCallback(() => {
    const request: LedgerFlowHandoffRequest = doesBrowserSupportWebHidApi()
      ? { kind: 'connect-start' }
      : { kind: 'unsupported-browser' };
    return whenPageMode({
      full() {
        openLedgerFlow(request);
      },
      popup() {
        void handOffLedgerFlowToFullPage(request, {
          target: RouteUrls.Onboarding,
          closeCurrentWindow: true,
        });
      },
    })();
  }, [openLedgerFlow]);

  return (
    <WelcomeLayout
      isGeneratingWallet={isGeneratingWallet}
      onSelectConnectLedger={onSelectConnectLedger}
      onStartOnboarding={startOnboarding}
      onRestoreWallet={restoreWallet}
    />
  );
}
