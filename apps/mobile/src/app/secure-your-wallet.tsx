import { useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedHeaderScreenLayout } from '@/components/headers/animated-header/animated-header-screen.layout';
import { SkipSecureWalletSheet } from '@/features/wallet-manager/secure-your-wallet/skip-secure-wallet-sheet';
import { useAuthentication } from '@/hooks/use-authentication';
import { useCreateWallet } from '@/hooks/use-create-wallet';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';
import { Image } from 'expo-image';

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
            <Image
              style={{ height: 270, width: 270 }}
              source={require('@/assets/stickers/lock.png')}
              contentFit="contain"
            />
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
