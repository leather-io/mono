import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { Content } from '@app/components/layout';
import { Header } from '@app/components/layout/headers/header';
import { HeaderBackButton } from '@app/components/layout/headers/header-back-button';
import { HeaderGrid } from '@app/components/layout/headers/header-grid';
import {
  DescriptionColumn,
  TwoColumnLayout,
} from '@app/components/layout/layouts/two-column.layout';
import {
  useActiveWalletSecretKey,
  useWalletSecretKey,
} from '@app/store/in-memory-key/in-memory-key.selectors';
import { SecretKey } from '@app/ui/components/secret-key/secret-key';

export function UnlockedViewSecretKey() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const activeWalletSecretKey = useActiveWalletSecretKey();
  const requestedWalletSecretKey = useWalletSecretKey(state?.fingerprint);

  const secretKey = state?.fingerprint ? requestedWalletSecretKey : activeWalletSecretKey;

  useEffect(() => {
    if (!secretKey) void navigate(-1);
  }, [secretKey, navigate]);

  if (!secretKey) return null;

  return (
    <>
      <Header px="space.04">
        <HeaderGrid leftCol={<HeaderBackButton />} rightCol={null} />
      </Header>
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
          rightColumn={<SecretKey secretKey={secretKey} onDone={() => navigate(-1)} />}
        />
      </Content>
    </>
  );
}
