import { Sheet, SheetHeader } from '@leather.io/ui';

import { RouteUrls } from '@shared/route-urls';
import { closeWindow } from '@shared/utils';

import { whenPageMode } from '@app/common/utils';
import { openIndexPageInNewTab } from '@app/common/utils/open-in-new-tab';
import { useLocation, useNavigate } from '@app/routes/compat';
import { useAppDispatch } from '@app/store';
import { ledgerNavigationSlice } from '@app/store/navigation/ledger-navigation.slice';
import { modalNavigationSlice } from '@app/store/navigation/modal-navigation.slice';

import { ConnectLedger } from './connect-ledger';

export function ConnectLedgerStacks() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  function onConnectStacks() {
    return whenPageMode({
      full() {
        dispatch(ledgerNavigationSlice.actions.setImmediatelyAttemptConnection(true));
        dispatch(
          ledgerNavigationSlice.actions.setLedgerTxSigningState({
            tx: '',
            fromLocationPathname: location.pathname,
          })
        );
        dispatch(modalNavigationSlice.actions.setBackgroundLocationPathname(RouteUrls.Home));
        void navigate('stacks/connect-your-ledger', {
          replace: true,
        });
      },
      popup() {
        void openIndexPageInNewTab(RouteUrls.Home);
        closeWindow();
      },
    });
  }

  return (
    <Sheet isShowing header={<SheetHeader />} onClose={() => navigate('../')}>
      <ConnectLedger connectStacks={onConnectStacks()} showInstructions />
    </Sheet>
  );
}
