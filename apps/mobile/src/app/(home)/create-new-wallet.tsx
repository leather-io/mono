import { useEffect, useState } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MnemonicDisplay } from '@/components/create-new-wallet/mnemonic-display';
import { useCreateWallet } from '@/hooks/create-wallet';
import { TestId } from '@/shared/test-id';
import { useSettings } from '@/store/settings/settings';
import { tempMnemonicStore } from '@/store/storage-persistors';
import { Trans, t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';

import { generateMnemonic } from '@leather.io/crypto';
import {
  BlurView,
  Box,
  Button,
  PointerHandIcon,
  QuestionCircleIcon,
  Text,
  Theme,
  TouchableOpacity,
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
    <Box
      flex={1}
      backgroundColor="ink.background-primary"
      justifyContent="space-between"
      style={{ paddingBottom: bottom + theme.spacing['5'] }}
    >
      <ScrollView style={{ paddingHorizontal: theme.spacing['5'] }}>
        <Box gap="3" pt="5">
          <TouchableOpacity
            onPress={() => {
              // TODO: show some kind of a helper here
            }}
            p="5"
            position="absolute"
            right={-theme.spacing['5']}
            zIndex={10}
            top={theme.spacing['1']}
          >
            <QuestionCircleIcon color={theme.colors['ink.text-primary']} variant="small" />
          </TouchableOpacity>
          <Box>
            <Trans id="create_new_wallet.title">
              <Text variant="heading03">BACK UP YOUR</Text>
              <Text variant="heading03">SECRET KEY</Text>
            </Trans>
          </Box>
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
              <TouchableOpacity
                onPress={() => setIsHidden(false)}
                height="100%"
                flexDirection="row"
                justifyContent="center"
                alignItems="center"
                gap="2"
                testID={TestId.walletCreationTapToReveal}
              >
                <PointerHandIcon />
                <Box>
                  <Trans id="create_new_wallet.view_secret_key_label">
                    <Text variant="label02">Tap to view Secret Key</Text>
                    <Text variant="label02" color="red.action-primary-default">
                      For your eyes only
                    </Text>
                  </Trans>
                </Box>
              </TouchableOpacity>
            </BlurView>
          )}
          <MnemonicDisplay mnemonic={mnemonic} />
        </Box>
      </ScrollView>
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
