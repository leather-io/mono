import { useNavigate } from 'react-router';

import { Sheet, SheetHeader } from '@leather.io/ui';

import { RouteUrls } from '@shared/route-urls';
import { closeWindow } from '@shared/utils';

import { doesBrowserSupportWebUsbApi, whenPageMode } from '@app/common/utils';
import { openIndexPageInNewTab } from '@app/common/utils/open-in-new-tab';

import { immediatelyAttemptLedgerConnection } from '../../hooks/use-when-reattempt-ledger-connection';
import { ConnectLedger } from './connect-ledger';

export function ConnectLedgerStart({
  initialRoute = RouteUrls.Onboarding,
}: {
  initialRoute?: RouteUrls;
}) {
  const navigate = useNavigate();

  function pageModeRoutingAction(url: string) {
    return whenPageMode({
      full() {
        void navigate(url, {
          replace: true,
          state: {
            [immediatelyAttemptLedgerConnection]: true,
            fromLocation: { pathname: initialRoute },
          },
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
      initialRoute + `/${chain}/` + RouteUrls.ConnectLedger
    );
    const doesNotSupportWebUsbAction = pageModeRoutingAction(
      initialRoute + '/' + RouteUrls.LedgerUnsupportedBrowser
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
