import { useRef } from 'react';

import { Screen } from '@/components/screen/screen';
import { SkipSecureWalletSheet } from '@/features/wallet-manager/secure-your-wallet/skip-secure-wallet-sheet';
import { useAuthentication } from '@/hooks/use-authentication';
import { useCreateWallet } from '@/hooks/use-create-wallet';
import { t } from '@lingui/core/macro';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';

import { Box, Button, SheetRef, Text } from '@leather.io/ui/native';

export default function SecureYourWalletScreen() {
  const sheetRef = useRef<SheetRef>(null);
  const { createWallet } = useCreateWallet();
  const { callIfEnrolled } = useAuthentication();
  const params = useLocalSearchParams();
  const walletType = params.type as 'read-write' | 'read-only';

  const pageTitle = t`Secure your wallet`;

  return (
    <Screen>
      <Screen.Header />
      <Screen.ScrollView>
        <Screen.Title>{pageTitle}</Screen.Title>
        <Box px="5">
          <Box gap="3">
            <Text variant="label01">
              {t`Use your device PIN, Face ID or other biometrics to secure your wallets`}
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
          title={t`Skip for now`}
        />
        <Button
          onPress={() => {
            void callIfEnrolled(() =>
              createWallet({ biometrics: true, isReadonly: walletType === 'read-only' })
            );
          }}
          buttonState="default"
          title={t`Enable device security`}
        />
      </Screen.Footer>
      <SkipSecureWalletSheet
        onSubmit={async () => {
          sheetRef.current?.close();
          await createWallet({ biometrics: false, isReadonly: walletType === 'read-only' });
        }}
        sheetRef={sheetRef}
      />
    </Screen>
  );
}
