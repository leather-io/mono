import { ReactNode, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedHeaderScreenLayout } from '@/components/headers/animated-header/animated-header-screen.layout';
import { MnemonicDisplay } from '@/features/wallet-manager/create-new-wallet/mnemonic-display';
import { useCreateWallet } from '@/hooks/use-create-wallet';
import { TestId } from '@/shared/test-id';
import { useSettings } from '@/store/settings/settings';
import { tempMnemonicStore } from '@/store/storage-persistors';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';
import { ImageBackground } from 'expo-image';

import { generateMnemonic } from '@leather.io/crypto';
import {
  BlurView,
  Box,
  Button,
  PointerHandIcon,
  Pressable,
  Text,
  Theme,
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
  const { bottom } = useSafeAreaInsets();
  const theme = useTheme<Theme>();
  const [isHidden, setIsHidden] = useState(true);
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const { navigateAndCreateWallet } = useCreateWallet();

  useEffect(() => {
    const tempMnemonic = generateMnemonic();
    setMnemonic(tempMnemonic);
    void tempMnemonicStore.setTemporaryMnemonic(tempMnemonic);
  }, []);

  const pageTitle = t({
    id: 'create_new_wallet.title',
    message: 'Back up your secret key',
  });

  return (
    <Box bg="ink.background-primary" flex={1} style={{ paddingBottom: bottom + theme.spacing[5] }}>
      <AnimatedHeaderScreenLayout
        // hidden until linked: https://linear.app/leather-io/issue/LEA-1916
        // rightTitleElement={<MoreInfoIcon onPress={() => {}} />}
        title={pageTitle}
        contentTitle={pageTitle}
      >
        <Box>
          <Text variant="label01">
            {t({
              id: 'create_new_wallet.subtitle',
              message:
                'Your Secret Key grants you access to your wallet and its assets. Write it down and store securely or use as safe password manager.',
            })}
          </Text>

          <Box
            my="5"
            borderWidth={1}
            borderColor="ink.border-default"
            borderRadius="xs"
            overflow="hidden"
          >
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
                    <Text variant="label02">
                      {t({
                        id: 'create_new_wallet.view_secret_key_label_a',
                        message: 'Tap to view Secret Key',
                      })}
                    </Text>
                    <Text variant="label02" color="red.action-primary-default">
                      {t({
                        id: 'create_new_wallet.view_secret_key_label_b',
                        message: 'For your eyes only',
                      })}
                    </Text>
                  </Box>
                </Pressable>
              </SecretBanner>
            )}
            <MnemonicDisplay mnemonic={mnemonic} />
          </Box>
        </Box>
      </AnimatedHeaderScreenLayout>
      <Box px="5" gap="4">
        <Button
          onPress={() => void navigateAndCreateWallet()}
          buttonState="default"
          title={t({
            id: 'create_new_wallet.button',
            message: `I've backed it up`,
          })}
          testID={TestId.walletCreationBackedUpButton}
        />
      </Box>
    </Box>
  );
}
