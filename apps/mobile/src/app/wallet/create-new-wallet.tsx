import { useEffect, useState } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedBlurView } from '@/components/blur-view';
import { Button } from '@/components/button';
import { MnemonicWordBox } from '@/components/create-new-wallet/mnemonic-word-box';
import { useToastContext } from '@/components/toast/toast-context';
import { useCreateWallet } from '@/hooks/create-wallet';
import { tempMnemonicStore } from '@/state/storage-persistors';
import { Trans, t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';
import * as Clipboard from 'expo-clipboard';

import { generateMnemonic } from '@leather.io/crypto';
import {
  Box,
  CopyIcon,
  GraduateCapIcon,
  PointerHandIcon,
  QuestionCircleIcon,
  Text,
  Theme,
  TouchableOpacity,
} from '@leather.io/ui/native';

function MnemonicDisplay({ mnemonic }: { mnemonic: string | null }) {
  if (!mnemonic) return null;

  const mnemonicWords = mnemonic.split(' ');

  return (
    <Box justifyContent="center" flexDirection="row" flexWrap="wrap" gap="2">
      {mnemonicWords.map((word, idx) => (
        <MnemonicWordBox key={word + idx} wordIdx={idx + 1} word={word} />
      ))}
    </Box>
  );
}

export default function CreateNewWallet() {
  const { bottom } = useSafeAreaInsets();
  const theme = useTheme<Theme>();
  const [isHidden, setIsHidden] = useState(true);
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const { navigateAndCreateWallet } = useCreateWallet();
  const { displayToast } = useToastContext();

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
            <ThemedBlurView
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
            </ThemedBlurView>
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
          onPress={async () => {
            if (mnemonic) {
              await Clipboard.setStringAsync(mnemonic);
              displayToast({ title: t`Successfully copied to clipboard!`, type: 'success' });
            }
          }}
          icon={<CopyIcon />}
          buttonState="ghost"
          title={t`Copy to clipboard`}
        />
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
