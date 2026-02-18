import { useSelector } from 'react-redux';

import { Content } from '@app/components/layout/layouts/content.layout';
import { HomeHeader } from '@app/features/container/headers/home.header';
import { TokenDetails } from '@app/features/token/token-details';
import { Home } from '@app/pages/home/home';
import { AccountGate } from '@app/routes/account-gate';
import { Outlet } from '@app/routes/compat';
import type { RootState } from '@app/store';

function BackgroundContent({ pathname }: { pathname: string }) {
  if (pathname.startsWith('/token/')) {
    return (
      <AccountGate>
        <TokenDetails />
      </AccountGate>
    );
  }
  return (
    <>
      <HomeHeader />
      <Content>
        <Home isBackground />
      </Content>
    </>
  );
}

export function ReceiveModalWrapper() {
  const backgroundPathname = useSelector(
    (state: RootState) => state.navigation.modal.backgroundLocationPathname
  );

  return (
    <>
      {backgroundPathname && <BackgroundContent pathname={backgroundPathname} />}
      <Outlet />
    </>
  );
}
