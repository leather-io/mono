import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Outlet, useLocation, useNavigate } from 'react-router';

import { whenPageMode } from '@app/common/utils';
import { Content } from '@app/components/layout';
import { RequestWalletAuthentication } from '@app/components/request-wallet-authentication';
import { UnlockHeader } from '@app/features/container/headers/unlock.header';
import { SignOut } from '@app/features/settings/sign-out/sign-out-confirm';
import { selectWalletAuthenticationCapabilities } from '@app/store/software-keys/software-key.selectors';

export function Unlock() {
  const navigate = useNavigate();
  const location = useLocation();
  const capabilities = useSelector(selectWalletAuthenticationCapabilities);
  const [showRecovery, setShowRecovery] = useState(false);
  // Here we want to return to the previous route. The user could land on any
  // page when the wallet is locked, so we can't assume as single route.
  function returnToPreviousRoute() {
    return whenPageMode({
      full: () => navigate(location.state?.from || '/'),
      popup: () => navigate(-1),
    })();
  }

  return (
    <>
      <UnlockHeader />
      <Content>
        <RequestWalletAuthentication
          automaticPromptOnActionPopup
          title="Unlock Leather"
          caption="Use your configured unlock method to continue."
          recoveryLabel={capabilities.password ? 'Forgot password?' : "Can't use biometrics?"}
          onRecovery={() => setShowRecovery(true)}
          onSuccess={returnToPreviousRoute}
        />
        <Outlet />
      </Content>
      {showRecovery && <SignOut onClose={() => setShowRecovery(false)} />}
    </>
  );
}
