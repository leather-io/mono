import { useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedHeaderScreenLayout } from '@/components/headers/animated-header/animated-header-screen.layout';
import { SkipSecureWalletSheet } from '@/components/secure-your-wallet/skip-secure-wallet-sheet';
import { useCreateWallet } from '@/hooks/use-create-wallet';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';

import { Box, Button, LockIcon, SheetRef, Text, Theme } from '@leather.io/ui/native';

export default function SecureYourWalletScreen() {
  const { bottom } = useSafeAreaInsets();
  const theme = useTheme<Theme>();
  const sheetRef = useRef<SheetRef>(null);
  const { createWallet } = useCreateWallet();

  return (
    <>
      <Box
        bg="ink.background-primary"
        flex={1}
        style={{ paddingBottom: bottom + theme.spacing[5] }}
      >
        <AnimatedHeaderScreenLayout
          // Hidden until linked
          // rightTitleElement={<MoreInfoIcon onPress={() => {}} />}
          title={t({
            id: 'secure_your_wallet.title',
            message: 'Secure your wallet',
          })}
        >
          <Box gap="3">
            <Text variant="label01">
              {t({
                id: 'secure_your_wallet.caption',
                message: `Use your device’s PIN, Face ID, or other biometrics for quick and secure access.`,
              })}
            </Text>
          </Box>
          <Box justifyContent="center" alignItems="center">
            <LockIcon height={204} width={204} />
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
            onPress={async () => {
              await createWallet({ biometrics: true });
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
