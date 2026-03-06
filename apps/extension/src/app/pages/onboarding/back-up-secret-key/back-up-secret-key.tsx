import { type ReactNode, useState } from 'react';

import { Flex, Stack, styled } from 'leather-styles/jsx';

import { Eye1ClosedIcon, KeyIcon, LockIcon } from '@leather.io/ui';

import { useKeyActions } from '@app/common/hooks/use-key-actions';
import { useOnMount } from '@app/common/hooks/use-on-mount';
import { Content } from '@app/components/layout';
import { Header } from '@app/components/layout/headers/header';
import { HeaderBackButton } from '@app/components/layout/headers/header-back-button';
import { HeaderGrid } from '@app/components/layout/headers/header-grid';
import {
  DescriptionColumn,
  TwoColumnLayout,
} from '@app/components/layout/layouts/two-column.layout';
import { SecretKey } from '@app/ui/components/secret-key/secret-key';

import { SetPasswordPage } from '../../onboarding/set-password/set-password';

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
  const keyActions = useKeyActions();
  const [mnemonicData, setMnemonicData] = useState<null | {
    mnemonic: string;
    fingerprint: string;
  }>();
  const [showPasswordPage, setShowPasswordPage] = useState(false);
  useOnMount(() => {
    const { mnemonic, fingerprint } = keyActions.generateWalletKey();
    setMnemonicData({ mnemonic, fingerprint });
  });

  // TODO: need some loading here
  if (!mnemonicData?.mnemonic) return null;
  return showPasswordPage ? (
    <SetPasswordPage mnemonicData={mnemonicData} onBack={() => setShowPasswordPage(false)} />
  ) : (
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
          rightColumn={
            <SecretKey
              secretKey={mnemonicData?.mnemonic}
              onDone={() => {
                setShowPasswordPage(true);
              }}
            />
          }
        />
      </Content>
    </>
  );
}
