import { useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { AnimatedHeaderScreenLayout } from '@/components/headers/animated-header/animated-header-screen.layout';
import { SkipSecureWalletSheet } from '@/features/wallet-manager/secure-your-wallet/skip-secure-wallet-sheet';
import { useAuthentication } from '@/hooks/use-authentication';
import { useCreateWallet } from '@/hooks/use-create-wallet';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';

import { Box, Button, SheetRef, Text, Theme } from '@leather.io/ui/native';

export default function SecureYourWalletScreen() {
  const { bottom } = useSafeAreaInsets();
  const theme = useTheme<Theme>();
  const sheetRef = useRef<SheetRef>(null);
  const { createWallet } = useCreateWallet();
  const { callIfEnrolled } = useAuthentication();

  const pageTitle = t({
    id: 'secure_your_wallet.title',
    message: 'Secure your wallet',
  });

  return (
    <>
      <Box
        bg="ink.background-primary"
        flex={1}
        style={{ paddingBottom: bottom + theme.spacing[5] }}
      >
        <AnimatedHeaderScreenLayout
          // hidden until linked: https://linear.app/leather-io/issue/LEA-1916
          // rightTitleElement={<MoreInfoIcon onPress={() => {}} />}
          title={pageTitle}
          contentTitle={pageTitle}
        >
          <Box gap="3">
            <Text variant="label01">
              {t({
                id: 'secure_your_wallet.caption',
                message: `Use your device’s PIN, Face ID, or other biometrics for quick and secure access.`,
              })}
            </Text>
          </Box>
          <Box justifyContent="center" alignItems="center" aspectRatio={1}>
            <CustomLockIcon />
          </Box>
        </AnimatedHeaderScreenLayout>
        <Box px="5">
          <Button
            onPress={() => {
              sheetRef.current?.present();
            }}
            pb="4"
            buttonState="ghost"
            title={t({
              id: 'secure_your_wallet.skip_button',
              message: `Skip for now`,
            })}
          />
          <Button
            onPress={() => {
              void callIfEnrolled(() => createWallet({ biometrics: true }));
            }}
            buttonState="default"
            title={t({
              id: 'secure_your_wallet.security_button',
              message: `Enable device security`,
            })}
          />
        </Box>
      </Box>
      <SkipSecureWalletSheet
        onSubmit={async () => {
          sheetRef.current?.close();
          await createWallet({ biometrics: false });
        }}
        sheetRef={sheetRef}
      />
    </>
  );
}

function CustomLockIcon() {
  return (
    <Svg width="204" height="204" viewBox="0 0 204 204" fill="none">
      <Path
        d="M136 85.5V60C136 41.2223 120.778 26 102 26C83.2223 26 68 41.2223 68 60V85.5M102 119.5V145M51 179H153C157.694 179 161.5 175.194 161.5 170.5V94C161.5 89.3056 157.694 85.5 153 85.5H51C46.3056 85.5 42.5 89.3056 42.5 94V170.5C42.5 175.194 46.3056 179 51 179Z"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
