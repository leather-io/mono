import { useSelector } from 'react-redux';

import { whenPageMode } from '@app/common/utils';
import { Content } from '@app/components/layout';
import { RequestPassword } from '@app/components/request-password';
import { UnlockHeader } from '@app/features/container/headers/unlock.header';
import { Outlet, useNavigate } from '@app/routes/compat';
import type { RootState } from '@app/store';

export function Unlock() {
  const navigate = useNavigate();
  const unlockReturnPath = useSelector(
    (state: RootState) => state.navigation.misc.unlockReturnPath
  );
  // Here we want to return to the previous route. The user could land on any
  // page when the wallet is locked, so we can't assume as single route.
  function returnToPreviousRoute() {
    return whenPageMode({
      full: () => navigate(unlockReturnPath || '/'),
      popup: () => navigate(-1),
    })();
  }

  return (
    <>
      <UnlockHeader />
      <Content>
        <RequestPassword onSuccess={returnToPreviousRoute} showForgotPassword />
        <Outlet />
      </Content>
    </>
  );
}
