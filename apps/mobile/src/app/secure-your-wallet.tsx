import { useRef } from 'react';

import lockImage from '@/assets/stickers/lock.png';
import { Screen } from '@/components/screen/screen';
import { SkipSecureWalletSheet } from '@/features/wallet-manager/secure-your-wallet/skip-secure-wallet-sheet';
import { useAuthentication } from '@/hooks/use-authentication';
import { useCreateWallet } from '@/hooks/use-create-wallet';
import { OnboardingSelectors } from '@/shared/selectors/onboarding.selectors';
import { t } from '@lingui/core/macro';
import { Image } from 'expo-image';

import { Box, Button, type SheetInstance, Text } from '@leather.io/ui/native';

export default function SecureYourWalletScreen() {
  const sheetRef = useRef<SheetInstance>(null);
  const { createWallet } = useCreateWallet();
  const { callIfEnrolled } = useAuthentication();

  const pageTitle = t`Secure your wallet`;

  async function onSkipSecureWallet() {
    sheetRef.current?.close();
    await createWallet({ biometrics: false });
  }

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
            <Image style={{ height: 270, width: 270 }} source={lockImage} contentFit="contain" />
          </Box>
        </Box>
      </Screen.ScrollView>

      <Screen.Footer>
        <Button
          onPress={() => sheetRef.current?.present()}
          pb="4"
          variant="ghost"
          testID={OnboardingSelectors.SecureYourWalletSkipButton}
        >
          {t`Skip for now`}
        </Button>
        <Button
          onPress={() => {
            void callIfEnrolled(() => createWallet({ biometrics: true }));
          }}
          testID={OnboardingSelectors.SecureYourWalletEnableButton}
        >
          {t`Enable device security`}
        </Button>
      </Screen.Footer>
      <SkipSecureWalletSheet onSubmit={() => void onSkipSecureWallet()} sheetRef={sheetRef} />
    </Screen>
  );
}
