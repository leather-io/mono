import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Checkmark from '@/assets/checkmark-circle.svg';
import CircleQuestionMark from '@/assets/circle-questionmark.svg';
import Copy from '@/assets/copy.svg';
import GraduateCap from '@/assets/graduate-cap.svg';
import Pointer from '@/assets/pointer.svg';
import { HEADER_HEIGHT } from '@/components/blurred-header';
import { Button } from '@/components/button';
import { MnemonicWordBox } from '@/components/create-new-wallet/mnemonic-word-box';
import { useTheme } from '@shopify/restyle';
import { BlurView } from 'expo-blur';
import * as Clipboard from 'expo-clipboard';

import { Box, Text, Theme, TouchableOpacity } from '@leather.io/ui/native';

function getTestMnemonic() {
  if (process.env.EXPO_PUBLIC_SECRET_KEY) {
    return process.env.EXPO_PUBLIC_SECRET_KEY;
  }
  throw new Error('No mnemonic is provided in EXPO_PUBLIC_SECRET_KEY');
}

export default function CreateNewWallet() {
  const { top, bottom } = useSafeAreaInsets();
  const theme = useTheme<Theme>();
  const contentOffsetTop = top + HEADER_HEIGHT;
  const test_array = getTestMnemonic().split(' ');
  const [isHidden, setIsHidden] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  return (
    <Box
      flex={1}
      backgroundColor="base.ink.background-primary"
      px="5"
      justifyContent="space-between"
      style={{ paddingTop: contentOffsetTop, paddingBottom: bottom + theme.spacing['5'] }}
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
          <Text variant="heading03">BACK UP YOUR SECRET KEY</Text>
          <Text variant="label01">
            Your Secret Key grants you access to your wallet and its assets.
          </Text>
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
                  <Text variant="label02">Tap to view Secret Key</Text>
                  <Text variant="label02" color="base.red.action-primary-default">
                    For your eyes only
                  </Text>
                </Box>
              </TouchableOpacity>
            </BlurView>
          )}

          <Box justifyContent="center" flexDirection="row" flexWrap="wrap" gap="2">
            {test_array.map((word, idx) => (
              <MnemonicWordBox key={word + idx} wordIdx={idx + 1} word={word} />
            ))}
          </Box>
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
            <Text
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
            </Text>
          </Box>
        </Box>
      </Box>
      <Box>
        <Button
          onPress={async () => {
            await Clipboard.setStringAsync(getTestMnemonic());
            setIsCopied(true);
          }}
          pb="4"
          Icon={isCopied ? Checkmark : Copy}
          buttonState="ghost"
          title={isCopied ? 'Copied to clipboard' : 'Copy to clipboard'}
        />
        <Button
          onPress={() => {
            // TODO: navigate to the next screen
          }}
          buttonState="default"
          title="I've backed it up"
        />
      </Box>
    </Box>
  );
}
