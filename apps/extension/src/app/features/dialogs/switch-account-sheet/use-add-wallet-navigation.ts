import { useNavigate } from 'react-router';

import { RouteUrls } from '@shared/route-urls';
import { closeWindow } from '@shared/utils';

import { doesBrowserSupportWebUsbApi, whenPageMode } from '@app/common/utils';
import { openIndexPageInNewTab } from '@app/common/utils/open-in-new-tab';

interface UseAddWalletNavigationArgs {
  closeSheets(): void;
}

export function useAddWalletNavigation({ closeSheets }: UseAddWalletNavigationArgs) {
  const navigate = useNavigate();

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

  function onCreateNewWallet() {
    closeSheets();
    return pageModeRoutingAction(RouteUrls.CreateWallet)();
  }

  function onRestoreWallet() {
    closeSheets();
    return pageModeRoutingAction(RouteUrls.AddWallet)();
  }

  function onConnectLedger() {
    closeSheets();
    if (doesBrowserSupportWebUsbApi()) {
      return pageModeRoutingAction(RouteUrls.ConnectLedgerStart)();
    }
    return pageModeRoutingAction(RouteUrls.LedgerUnsupportedBrowser)();
  }

  return { onCreateNewWallet, onRestoreWallet, onConnectLedger };
}
