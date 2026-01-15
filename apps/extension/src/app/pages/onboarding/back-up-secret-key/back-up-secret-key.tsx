import { type ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router';

import { Flex, Stack, styled } from 'leather-styles/jsx';

import { Eye1ClosedIcon, KeyIcon, LockIcon } from '@leather.io/ui';

import { RouteUrls } from '@shared/route-urls';

import { Content } from '@app/components/layout';
import { Header } from '@app/components/layout/headers/header';
import { HeaderBackButton } from '@app/components/layout/headers/header-back-button';
import { HeaderGrid } from '@app/components/layout/headers/header-grid';
import {
  DescriptionColumn,
  TwoColumnLayout,
} from '@app/components/layout/layouts/two-column.layout';
import { useDefaultWalletSecretKey } from '@app/store/in-memory-key/in-memory-key.selectors';
import { SecretKey } from '@app/ui/components/secret-key-current/secret-key';

interface BulletPointProps {
  icon: ReactNode;
  text: string;
}
function BulletPoint({ icon, text }: BulletPointProps) {
  return (
    <Flex gap="space.02" alignItems="center">
      {icon}
      <styled.span textStyle="caption.01">{text}</styled.span>
    </Flex>
  );
}

export function BackUpSecretKeyPage() {
  const secretKey = useDefaultWalletSecretKey();
  const navigate = useNavigate();

  useEffect(() => {
    if (!secretKey) void navigate(RouteUrls.Onboarding);
  }, [navigate, secretKey]);

  if (!secretKey) return null;

  return (
    <>
      <Header px="space.04">
        <HeaderGrid leftCol={<HeaderBackButton />} rightCol={null} />
      </Header>

      <Content>
        <TwoColumnLayout
          leftColumn={
            <>
              <DescriptionColumn
                title="Back up your Secret Key"
                description="You'll need it to access your wallet on a new device, or this one if you lose your password — so back it up somewhere safe!"
              />
              <Stack width="3/4" gap="space.05" mt="space.04">
                <BulletPoint
                  icon={<KeyIcon />}
                  text="Your Secret Key gives access to your wallet"
                />
                <BulletPoint
                  icon={<Eye1ClosedIcon />}
                  text="Never share your Secret Key with anyone"
                />
                <BulletPoint
                  icon={<LockIcon />}
                  text="Store it somewhere 100% private and secure"
                />
              </Stack>
            </>
          }
          rightColumn={<SecretKey secretKey={secretKey} />}
        />
      </Content>
    </>
  );
}
