import { useRef } from 'react';

import { Screen } from '@/components/screen/screen';
import { SkipSecureWalletSheet } from '@/features/wallet-manager/secure-your-wallet/skip-secure-wallet-sheet';
import { useAuthentication } from '@/hooks/use-authentication';
import { useCreateWallet } from '@/hooks/use-create-wallet';
import { t } from '@lingui/macro';
import { Image } from 'expo-image';

import { Box, Button, SheetRef, Text } from '@leather.io/ui/native';

export default function SecureYourWalletScreen() {
  const sheetRef = useRef<SheetRef>(null);
  const { createWallet } = useCreateWallet();
  const { callIfEnrolled } = useAuthentication();

  const pageTitle = t({
    id: 'secure_your_wallet.title',
    message: 'Secure your wallet',
  });

  return (
    <Screen>
      <Screen.Header />
      <Screen.ScrollView>
        <Screen.Title>{pageTitle}</Screen.Title>
        <Box px="5">
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
        </Box>
      </Screen.ScrollView>

      <Screen.Footer>
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
      </Screen.Footer>
      <SkipSecureWalletSheet
        onSubmit={async () => {
          sheetRef.current?.close();
          await createWallet({ biometrics: false });
        }}
        sheetRef={sheetRef}
      />
    </Screen>
  );
}
