import { createContext, useContext } from 'react';

import { delay } from '@leather.io/utils';

import { RouteUrls } from '@shared/route-urls';
import { analytics } from '@shared/utils/analytics';

import { openInNewTab } from '@app/common/utils/open-in-new-tab';
import { Outlet, useNavigate } from '@app/routes/compat';

import { LeatherIntroSheet } from './leather-intro-steps';

interface IntroContextProps {
  onRevealNewName(): void;
  onAcceptTerms(): void;
  onRejectAndUninstall(): void;
}
const introContext = createContext<IntroContextProps | null>(null);

const { Provider: LeatherIntroSheetProvider } = introContext;

export function useLeatherIntroSheetContext() {
  const context = useContext(introContext);
  if (!context) throw new Error('useLeatherIntroSheetContext must be used within a Provider');
  return context;
}

export function LeatherIntroSheetContainer() {
  const navigate = useNavigate();
  async function onRevealNewName() {
    analytics.track('new_brand_reveal_name');
    await delay(4000);
    void navigate(`${RouteUrls.Unlock}/introducing-leather`, { replace: true });
  }

  function onAcceptTerms() {
    analytics.track('new_brand_accept_terms');
    void navigate(RouteUrls.Unlock, { replace: true });
  }

  function onRejectAndUninstall() {
    analytics.track('new_brand_reject_terms');
    openInNewTab('https://leather.gitbook.io/guides/troubleshooting/uninstall-wallet');
  }

  return (
    <LeatherIntroSheetProvider value={{ onRevealNewName, onAcceptTerms, onRejectAndUninstall }}>
      <LeatherIntroSheet>
        <Outlet />
      </LeatherIntroSheet>
    </LeatherIntroSheetProvider>
  );
}
