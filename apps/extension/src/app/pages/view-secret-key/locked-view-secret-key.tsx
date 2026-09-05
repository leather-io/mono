import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';

import { Flex } from 'leather-styles/jsx';

import { analytics } from '@shared/utils/analytics';

import { Content } from '@app/components/layout';
import { Header } from '@app/components/layout/headers/header';
import { HeaderBackButton } from '@app/components/layout/headers/header-back-button';
import { HeaderGrid } from '@app/components/layout/headers/header-grid';
import { RequestWalletAuthentication } from '@app/components/request-wallet-authentication';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

interface LockedViewSecretKeyProps {
  onUnlock(): void;
}
export function LockedViewSecretKey({ onUnlock }: LockedViewSecretKeyProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const locationState: unknown = location.state;
  const startWithBiometrics =
    isRecord(locationState) && locationState.startWalletAuthentication === true;

  useEffect(() => {
    analytics.page('view', '/save-secret-key');
  }, []);

  function consumeStartIntent() {
    if (!isRecord(locationState)) return;
    const { startWalletAuthentication: consumed, ...preservedState } = locationState;
    void consumed;
    void navigate(location.pathname, { replace: true, state: preservedState });
  }

  return (
    <Flex height="100vh" direction="column">
      <Header px="space.04">
        <HeaderGrid leftCol={<HeaderBackButton />} rightCol={null} />
      </Header>
      <Content>
        <RequestWalletAuthentication
          title="Confirm it's you to view your Secret Key"
          caption="Your Secret Key stays hidden until you confirm."
          startWithBiometrics={startWithBiometrics}
          onConsumeStartIntent={consumeStartIntent}
          onSuccess={onUnlock}
        />
        <Outlet />
      </Content>
    </Flex>
  );
}
