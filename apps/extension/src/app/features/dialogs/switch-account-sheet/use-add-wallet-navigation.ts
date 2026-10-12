import { useNavigate } from 'react-router';

import { RouteUrls } from '@shared/route-urls';
import { closeWindow } from '@shared/utils';

import { doesBrowserSupportWebHidApi, whenPageMode } from '@app/common/utils';
import { openIndexPageInNewTab } from '@app/common/utils/open-in-new-tab';
import { handOffLedgerFlowToFullPage } from '@app/features/ledger/flow/ledger-flow-handoff';
import { useLedgerFlow } from '@app/features/ledger/flow/ledger-flow.context';
import type { LedgerFlowHandoffRequest } from '@app/features/ledger/flow/ledger-flow.types';

interface UseAddWalletNavigationArgs {
  closeSheets(): void;
}

export function useAddWalletNavigation({ closeSheets }: UseAddWalletNavigationArgs) {
  const navigate = useNavigate();
  const { open: openLedgerFlow } = useLedgerFlow();

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
    const request: LedgerFlowHandoffRequest = doesBrowserSupportWebHidApi()
      ? { kind: 'connect-start' }
      : { kind: 'unsupported-browser' };
    return whenPageMode({
      full() {
        openLedgerFlow(request);
      },
      popup() {
        void handOffLedgerFlowToFullPage(request, { closeCurrentWindow: true });
      },
    })();
  }

  return { onCreateNewWallet, onRestoreWallet, onConnectLedger };
}
