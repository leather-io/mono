import { useEffect, useState } from 'react';
import { Outlet } from 'react-router';

import { Flex } from 'leather-styles/jsx';

import { analytics } from '@shared/utils/analytics';

import { Content } from '@app/components/layout';
import { Header } from '@app/components/layout/headers/header';
import { HeaderBackButton } from '@app/components/layout/headers/header-back-button';
import { HeaderGrid } from '@app/components/layout/headers/header-grid';
import {
  DescriptionColumn,
  TwoColumnLayout,
} from '@app/components/layout/layouts/two-column-current.layout';
import { RequestPassword } from '@app/components/request-password';
import { useDefaultWalletSecretKey } from '@app/store/in-memory-key/in-memory-key.selectors';
import { SecretKey } from '@app/ui/components/secret-key-current/secret-key';

export function ViewSecretKey() {
  const defaultWalletSecretKey = useDefaultWalletSecretKey();
  const [showSecretKey, setShowSecretKey] = useState(false);

  useEffect(() => {
    analytics.page('view', '/save-secret-key');
  }, []);

  const header = (
    <Header px="space.04">
      <HeaderGrid leftCol={<HeaderBackButton />} rightCol={null} />
    </Header>
  );

  if (showSecretKey) {
    return (
      <>
        {header}
        <Content>
          <TwoColumnLayout
            leftColumn={
              <DescriptionColumn
                title="Secret Key"
                description="These 24 words are your Secret Key. They create your account, and you sign in on
            different devices with them. Make sure to save these somewhere safe. If you lose these
            words, you lose your account."
              />
            }
            rightColumn={<SecretKey secretKey={defaultWalletSecretKey ?? ''} />}
          />
        </Content>
      </>
    );
  }

  return (
    <>
      <Flex height="100vh" direction="column">
        {header}
        <Content>
          <RequestPassword onSuccess={() => setShowSecretKey(true)} />
          <Outlet />
        </Content>
      </Flex>
    </>
  );
}
