import { useEffect, useState } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MnemonicDisplay } from '@/components/create-new-wallet/mnemonic-display';
import { useCreateWallet } from '@/hooks/create-wallet';
import { useSettings } from '@/store/settings/settings.write';
import { tempMnemonicStore } from '@/store/storage-persistors';
import { Trans, t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';

import { generateMnemonic } from '@leather.io/crypto';
import {
  BlurView,
  Box,
  Button,
  GraduateCapIcon,
  PointerHandIcon,
  QuestionCircleIcon,
  Text,
  Theme,
  TouchableOpacity,
} from '@leather.io/ui/native';

export default function CreateNewWallet() {
  const { bottom } = useSafeAreaInsets();
  const theme = useTheme<Theme>();

  const { theme: themeVariant } = useSettings();
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
            <Trans>
              <Text variant="heading03">BACK UP YOUR</Text>
              <Text variant="heading03">SECRET KEY</Text>
            </Trans>
          </Box>
          <Text variant="label01">
            {t`Your Secret Key grants you access to your wallet and its assets.`}
          </Text>
        </Box>

        <Box my="5">
          {isHidden && (
            <BlurView
              themeVariant={themeVariant}
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
              >
                <PointerHandIcon />
                <Box>
                  <Text variant="label02">{t`Tap to view Secret Key`}</Text>
                  <Text variant="label02" color="red.action-primary-default">
                    {t`For your eyes only`}
                  </Text>
                </Box>
              </TouchableOpacity>
            </BlurView>
          )}
          <MnemonicDisplay mnemonic={mnemonic} />
          <Box p="3" mt="3" flexDirection="row" gap="4" borderRadius="xs">
            <GraduateCapIcon color={theme.colors['ink.text-subdued']} />
            <Text
              style={{
                flexShrink: 1,
                flexDirection: 'row',
                flexWrap: 'wrap',
              }}
              variant="label03"
              color="ink.text-subdued"
            >
              {t`We recommend writing these words in numbered order on a piece of paper and storing it in a safe place.`}{' '}
              <Text
                onPress={() => {
                  // TODO: navigate to a website
                }}
                variant="label03"
                color="ink.text-subdued"
                textDecorationLine="underline"
              >
                {t`Learn more`}
              </Text>
              {' ->'}
            </Text>
          </Box>
        </Box>
      </ScrollView>
      <Box px="5" gap="4">
        <Button
          onPress={() => {
            navigateAndCreateWallet();
          }}
          buttonState="default"
          title={t`I've backed it up`}
        />
      </Box>
    </Box>
  );
}
