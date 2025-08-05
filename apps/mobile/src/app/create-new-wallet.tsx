import { ReactNode, useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { Screen } from '@/components/screen/screen';
import { MnemonicDisplay } from '@/features/wallet-manager/create-new-wallet/mnemonic-display';
import { useCreateWallet } from '@/hooks/use-create-wallet';
import { TestId } from '@/shared/test-id';
import { useSettings } from '@/store/settings/settings';
import { tempMnemonicStore } from '@/store/storage-persistors';
import { t } from '@lingui/core/macro';
import { ImageBackground } from 'expo-image';

import { generateMnemonic } from '@leather.io/crypto';
import {
  BlurView,
  Box,
  Button,
  PointerHandIcon,
  Pressable,
  Text,
  legacyTouchablePressEffect,
} from '@leather.io/ui/native';

function SecretBanner({ children, isHidden }: { children: ReactNode; isHidden: boolean }) {
  const { themeDerivedFromThemePreference } = useSettings();
  const { whenTheme } = useSettings();
  return Platform.select({
    ios: (
      <BlurView
        experimentalBlurMethod="dimezisBlurView"
        themeVariant={themeDerivedFromThemePreference}
        intensity={isHidden ? 30 : 0}
        style={{
          position: 'absolute',
          top: -20,
          bottom: -20,
          left: -20,
          right: -20,
          zIndex: 10,
        }}
      >
        {children}
      </BlurView>
    ),
    android: (
      <ImageBackground
        contentFit="fill"
        imageStyle={{}}
        source={whenTheme({
          light: require('../assets/secret-blurred-light.png'),
          dark: require('../assets/secret-blurred-dark.png'),
        })}
        style={{
          position: 'absolute',
          top: -20,
          bottom: -20,
          left: -20,
          right: -20,
          zIndex: 10,
        }}
      >
        {children}
      </ImageBackground>
    ),
  });
}

export default function CreateNewWallet() {
  const [isHidden, setIsHidden] = useState(true);
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const { navigateAndCreateWallet } = useCreateWallet();

  useEffect(() => {
    const tempMnemonic = generateMnemonic();
    setMnemonic(tempMnemonic);
    void tempMnemonicStore.setTemporaryMnemonic(tempMnemonic);
  }, []);

  const pageTitle = t`Back up your Secret Key`;

  return (
    <Screen>
      <Screen.Header />
      <Screen.ScrollView>
        <Screen.Title>{pageTitle}</Screen.Title>
        <Box px="5" gap="5">
          <Text variant="label01">
            {t`Your Secret Key grants you access to your wallet and its assets. Store it securely since it can never be recovered if lost or stolen.`}
          </Text>

          <Box borderWidth={1} borderColor="ink.border-default" borderRadius="xs" overflow="hidden">
            {isHidden && (
              <SecretBanner isHidden={isHidden}>
                <Pressable
                  onPress={() => setIsHidden(false)}
                  height="100%"
                  flexDirection="row"
                  justifyContent="center"
                  alignItems="center"
                  gap="2"
                  pressEffects={legacyTouchablePressEffect}
                  testID={TestId.walletCreationTapToReveal}
                >
                  <PointerHandIcon />
                  <Box>
                    <Text variant="label02">{t`Tap to view Secret Key`}</Text>
                    <Text variant="label02" color="red.action-primary-default">
                      {t`For your eyes only`}
                    </Text>
                  </Box>
                </Pressable>
              </SecretBanner>
            )}
            <MnemonicDisplay mnemonic={mnemonic} />
          </Box>
        </Box>
      </Screen.ScrollView>

      <Screen.Footer>
        <Button
          disabled={isHidden}
          onPress={() => void navigateAndCreateWallet()}
          buttonState="default"
          title={t`I’ve backed it up`}
          testID={TestId.walletCreationBackedUpButton}
        />
      </Screen.Footer>
    </Screen>
  );
}
