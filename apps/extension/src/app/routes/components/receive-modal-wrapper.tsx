import { Outlet, Route, Routes } from 'react-router';

import { RouteUrls } from '@shared/route-urls';

import { useLocationState } from '@app/common/hooks/use-location-state';
import { Content } from '@app/components/layout/layouts/content.layout';
import { SwitchAccountLayout } from '@app/components/layout/layouts/switch-account.layout';
import { HomeHeader } from '@app/features/container/headers/home.header';
import { TokenDetails } from '@app/features/token/token-details';
import { Home } from '@app/pages/home/home';
import { AccountGate } from '@app/routes/account-gate';

export function ReceiveModalWrapper() {
  const backgroundLocation = useLocationState<Location>('backgroundLocation');

  if (!backgroundLocation) {
    return <Outlet />;
  }

  return (
    <>
      <Routes location={backgroundLocation}>
        <Route
          path={RouteUrls.TokenDetails}
          element={
            <AccountGate>
              <TokenDetails />
            </AccountGate>
          }
        />
        <Route
          element={
            <>
              <HomeHeader />
              <Content>
                <SwitchAccountLayout />
              </Content>
            </>
          }
        >
          <Route
            path="/*"
            element={
              <AccountGate>
                <Home isBackground />
              </AccountGate>
            }
          />
        </Route>
      </Routes>
      <Outlet />
    </>
  );
}
