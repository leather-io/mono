import { Navigate, Outlet, useLocation, useNavigate } from 'react-router';

import { logger } from '@shared/logger';
import { RouteUrls } from '@shared/route-urls';
import { closeWindow } from '@shared/utils';

import { useCancelAuthRequest } from '@app/common/authentication/use-cancel-auth-request';
import { useFinishAuthRequest } from '@app/common/authentication/use-finish-auth-request';
import { useAppDetails } from '@app/common/hooks/auth/use-app-details';
import { useOnMount } from '@app/common/hooks/use-on-mount';
import { initialSearchParams } from '@app/common/initial-search-params';
import { appEvents } from '@app/common/publish-subscribe';
import { useSwitchAccountSheet } from '@app/common/switch-account/use-switch-account-sheet-context';
import { useWalletType } from '@app/common/use-wallet-type';
import { openInNewTab } from '@app/common/utils/open-in-new-tab';
import { CurrentAccountDisplayer } from '@app/features/current-account/current-account-displayer';
import { LegacyRequestCallout } from '@app/features/legacy-request-callout/legacy-request-callout';
import { useOnOriginTabClose } from '@app/routes/hooks/use-on-tab-closed';
import { useCurrentAccountId } from '@app/store/accounts/account';

import { ConnectAccountLayout } from '../../components/connect-account/connect-account.layout';

function listenForJwtSigningComplete() {
  return new Promise(resolve =>
    appEvents.subscribe('ledgerJwtMessageSigningComplete', () => resolve(true))
  );
}

export function LegacyAccountAuth() {
  const flow = initialSearchParams.get('flow');
  const { url } = useAppDetails();
  const currentAccount = useCurrentAccountId();
  const accountIndex = currentAccount.accountIndex;
  const finishSignIn = useFinishAuthRequest();
  const { toggleSwitchAccount } = useSwitchAccountSheet();
  const { whenWallet } = useWalletType();
  const navigate = useNavigate();
  const location = useLocation();

  useOnOriginTabClose(() => closeWindow());

  const cancelAuthentication = useCancelAuthRequest();

  function handleUnmount() {
    return cancelAuthentication();
  }
  useOnMount(() => window.addEventListener('beforeunload', handleUnmount));

  async function signIntoAccount(index: number) {
    await whenWallet({
      async software() {
        await finishSignIn(index);
      },
      async ledger() {
        void navigate(RouteUrls.ConnectLedger, { state: { index, fromLocation: location } });
        await listenForJwtSigningComplete();
      },
    })();
  }

  if (!url) {
    logger.error('Legacy account auth request is missing app details from the popup url');
    return (
      <Navigate
        to={RouteUrls.RequestError}
        state={{
          title: 'Connection request failed',
          message:
            'This connection request is missing information from the requesting app. Please close this window and try connecting again.',
        }}
      />
    );
  }

  return (
    <>
      <ConnectAccountLayout
        banner={flow ? <LegacyRequestCallout origin={url.origin} method={flow} /> : undefined}
        requester={url.origin}
        onUserApprovesGetAddresses={async () => signIntoAccount(accountIndex)}
        // Here we should refocus the tab that initiated the request, however
        // because the old auth code doesn't have the tab id and should be
        // eventually removed, we just open in a new tab
        onClickRequestedByLink={() => openInNewTab(url.origin)}
        switchAccount={<CurrentAccountDisplayer onSelectAccount={toggleSwitchAccount} />}
      />
      <Outlet />
    </>
  );
}
