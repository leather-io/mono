import { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Checkmark from '@/assets/checkmark-circle.svg';
import CircleQuestionMark from '@/assets/circle-questionmark.svg';
import Copy from '@/assets/copy.svg';
import GraduateCap from '@/assets/graduate-cap.svg';
import Pointer from '@/assets/pointer.svg';
import { Button } from '@/components/button';
import { MnemonicWordBox } from '@/components/create-new-wallet/mnemonic-word-box';
import { TransText } from '@/components/trans-text';
import { APP_ROUTES } from '@/constants';
import { tempMnemonicStore } from '@/state/storage-persistors';
import { useTheme } from '@shopify/restyle';
import { BlurView } from 'expo-blur';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';

import { generateMnemonic } from '@leather.io/crypto';
import { Box, Text, Theme, TouchableOpacity } from '@leather.io/ui/native';

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
  const router = useRouter();
  const [isHidden, setIsHidden] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [mnemonic, setMnemonic] = useState<string | null>(null);

  useEffect(() => {
    const tempMnemonic = generateMnemonic();
    setMnemonic(tempMnemonic);
    tempMnemonicStore.setTemporaryMnemonic(tempMnemonic);
  }, []);

  return (
    <Box
      flex={1}
      backgroundColor="base.ink.background-primary"
      px="5"
      justifyContent="space-between"
      style={{ paddingBottom: bottom + theme.spacing['5'] }}
    >
      <Box>
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
            <CircleQuestionMark
              height={16}
              width={16}
              color={theme.colors['base.ink.text-primary']}
            />
          </TouchableOpacity>
          <TransText variant="heading03">BACK UP YOUR SECRET KEY</TransText>
          <TransText variant="label01">
            Your Secret Key grants you access to your wallet and its assets.
          </TransText>
        </Box>

        <Box my="5">
          {isHidden && (
            <BlurView
              tint="systemChromeMaterialLight"
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
                <Pointer height={24} width={24} color={theme.colors['base.ink.text-primary']} />
                <Box>
                  <TransText variant="label02">Tap to view Secret Key</TransText>
                  <TransText variant="label02" color="base.red.action-primary-default">
                    For your eyes only
                  </TransText>
                </Box>
              </TouchableOpacity>
            </BlurView>
          )}
          <MnemonicDisplay mnemonic={mnemonic} />
          <Box
            p="3"
            mt="3"
            flexDirection="row"
            gap="4"
            borderColor="base.ink.text-subdued"
            borderRadius="xs"
            borderWidth={1}
          >
            <GraduateCap height={24} width={24} color={theme.colors['base.ink.text-subdued']} />
            <TransText
              style={{
                flexShrink: 1,
                flexDirection: 'row',
                flexWrap: 'wrap',
              }}
              variant="label03"
              color="base.ink.text-subdued"
            >
              We recommend writing these words in numbered order on a piece of paper and storing it
              in a safe place.{' '}
              <Text
                onPress={() => {
                  // TODO: navigate to a website
                }}
                variant="label03"
                color="base.ink.text-subdued"
                textDecorationLine="underline"
              >
                Learn more
              </Text>
              {' ->'}
            </TransText>
          </Box>
        </Box>
      </Box>
      <Box>
        <Button
          onPress={async () => {
            if (mnemonic) {
              await Clipboard.setStringAsync(mnemonic);
              setIsCopied(true);
            }
          }}
          pb="4"
          Icon={isCopied ? Checkmark : Copy}
          buttonState="ghost"
          title={isCopied ? 'Copied to clipboard' : 'Copy to clipboard'}
        />
        <Button
          onPress={() => {
            router.navigate(APP_ROUTES.WalletSecureYourWallet);
          }}
          buttonState="default"
          title="I've backed it up"
        />
      </Box>
    </Box>
  );
}
