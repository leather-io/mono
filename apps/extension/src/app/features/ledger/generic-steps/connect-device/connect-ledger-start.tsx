import { Sheet, SheetHeader } from '@leather.io/ui';

import { RouteUrls } from '@shared/route-urls';
import { closeWindow } from '@shared/utils';

import { doesBrowserSupportWebUsbApi, whenPageMode } from '@app/common/utils';
import { openIndexPageInNewTab } from '@app/common/utils/open-in-new-tab';
import { useLocation, useNavigate } from '@app/routes/compat';
import { useAppDispatch } from '@app/store';
import { ledgerNavigationSlice } from '@app/store/navigation/ledger-navigation.slice';

import { ConnectLedger } from './connect-ledger';

export function ConnectLedgerStart() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  function pageModeRoutingAction(url: string) {
    return whenPageMode({
      full() {
        dispatch(ledgerNavigationSlice.actions.setImmediatelyAttemptConnection(true));
        dispatch(
          ledgerNavigationSlice.actions.setLedgerTxSigningState({
            tx: '',
            fromLocationPathname: location.pathname,
          })
        );
        void navigate(url, {
          replace: true,
        });
      },
      popup() {
        void openIndexPageInNewTab(url);
        closeWindow();
      },
    });
  }

  function connectChain(chain: string) {
    const supportsWebUsbAction = pageModeRoutingAction(
      RouteUrls.Onboarding + `/${chain}/` + RouteUrls.ConnectLedger
    );
    const doesNotSupportWebUsbAction = pageModeRoutingAction(
      RouteUrls.Onboarding + '/' + RouteUrls.LedgerUnsupportedBrowser
    );

    return doesBrowserSupportWebUsbApi() ? supportsWebUsbAction() : doesNotSupportWebUsbAction();
  }

  return (
    <Sheet isShowing header={<SheetHeader />} onClose={() => navigate('../')}>
      <ConnectLedger
        connectBitcoin={() => connectChain('bitcoin')}
        connectStacks={() => connectChain('stacks')}
        showInstructions
      />
    </Sheet>
  );
}
