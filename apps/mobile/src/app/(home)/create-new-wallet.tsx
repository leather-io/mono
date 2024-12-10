import { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MnemonicDisplay } from '@/components/create-new-wallet/mnemonic-display';
import { AnimatedHeaderScreenLayout } from '@/components/headers/animated-header/animated-header-screen.layout';
import { MoreInfoIcon } from '@/components/more-info-icon';
import { useCreateWallet } from '@/hooks/use-create-wallet';
import { TestId } from '@/shared/test-id';
import { useSettings } from '@/store/settings/settings';
import { tempMnemonicStore } from '@/store/storage-persistors';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';

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

export default function CreateNewWallet() {
  const { bottom } = useSafeAreaInsets();
  const theme = useTheme<Theme>();

  const { themeDerivedFromThemePreference } = useSettings();
  const [isHidden, setIsHidden] = useState(true);
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const { navigateAndCreateWallet } = useCreateWallet();

  useEffect(() => {
    const tempMnemonic = generateMnemonic();
    setMnemonic(tempMnemonic);
    void tempMnemonicStore.setTemporaryMnemonic(tempMnemonic);
  }, []);

  return (
    <Box bg="ink.background-primary" flex={1} style={{ paddingBottom: bottom + theme.spacing[5] }}>
      <AnimatedHeaderScreenLayout
        rightTitleElement={<MoreInfoIcon onPress={() => {}} />}
        title={t({
          id: 'create_new_wallet.title',
          message: 'Back up your secret key',
        })}
      >
        <Box>
          <Text variant="label01">
            {t({
              id: 'create_new_wallet.subtitle',
              message:
                'Your Secret Key grants you access to your wallet and its assets. Write it down and store securely or use as safe password manager.',
            })}
          </Text>
        </Box>

        <Box my="5">
          {isHidden && (
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
            </BlurView>
          )}
          <MnemonicDisplay mnemonic={mnemonic} />
        </Box>
      </AnimatedHeaderScreenLayout>
      <Box px="5" gap="4">
        <Button
          onPress={() => {
            navigateAndCreateWallet();
          }}
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
