import { useRef, useState } from 'react';
import { Keyboard, TextInput as RNTextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedHeaderScreenWithKeyboardLayout } from '@/components/headers/animated-header/animated-header-screen-with-keyboard.layout';
import { RecoverWalletSheet } from '@/components/recover-wallet/recover-wallet-sheet';
import { InputState, TextInput } from '@/components/text-input';
import { useCreateWallet } from '@/hooks/use-create-wallet';
import { TestId } from '@/shared/test-id';
import { tempMnemonicStore } from '@/store/storage-persistors';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';
import * as Clipboard from 'expo-clipboard';

import { isValidMnemonic, isValidMnemonicWord } from '@leather.io/crypto';
import {
  Accordion,
  Box,
  Button,
  Cell,
  ChevronRightIcon,
  LockIcon,
  NoteEmptyIcon,
  SheetRef,
  Text,
  Theme,
} from '@leather.io/ui/native';

function constructErrorMessage(invalidWords: string[]) {
  const joinedInvalidWords = invalidWords.join(', ');
  return t({
    id: 'recover_wallet.validation_error',
    message: `Invalid words: ${joinedInvalidWords}`,
  });
}

function getInvalidMnemonicWords(recoveryMnemonic: string) {
  return recoveryMnemonic
    .trim()
    .split(/\s+/g)
    .filter(word => !isValidMnemonicWord(word));
}

export default function RecoverWallet() {
  const { bottom } = useSafeAreaInsets();
  const theme = useTheme<Theme>();
  const [recoveryMnemonic, setRecoveryMnemonic] = useState('');
  const inputRef = useRef<RNTextInput>(null);
  const [inputState, setInputState] = useState<InputState>('default');
  const [errorMessage, setErrorMessage] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const recoverWalletSheetRef = useRef<SheetRef>(null);
  const [passphrase, setPassphrase] = useState('');
  const { navigateAndCreateWallet } = useCreateWallet();
  const hidePasteButton = recoveryMnemonic.length > 0;

  function validateMnemonicOnBlur() {
    const invalidWords = getInvalidMnemonicWords(recoveryMnemonic);
    const isError = invalidWords.length !== 0;
    if (recoveryMnemonic.length > 0 && isError) {
      setInputState('error');
      setErrorMessage(constructErrorMessage(invalidWords));
    } else {
      setInputState('default');
      setErrorMessage('');
    }
  }

  function checkMnemonic(text: string) {
    const isValid = isValidMnemonic(text);
    if (isValid) {
      setIsButtonDisabled(false);
    } else {
      setIsButtonDisabled(true);
    }
  }

  async function onChangeText(text: string) {
    checkMnemonic(text);
    setRecoveryMnemonic(text);
    setInputState('default');
    const copiedString = await Clipboard.getStringAsync();
    if (text === copiedString) {
      Keyboard.dismiss();
    }
  }

  async function onSubmit() {
    const isValid = isValidMnemonic(recoveryMnemonic);
    if (isValid) {
      await tempMnemonicStore.setTemporaryMnemonic(recoveryMnemonic, passphrase);
      void navigateAndCreateWallet();
    }
  }

  async function pasteFromClipboard() {
    const copiedString = await Clipboard.getStringAsync();
    setRecoveryMnemonic(copiedString);
    checkMnemonic(copiedString);
    inputRef.current?.focus();
  }

  return (
    <>
      <Box
        bg="ink.background-primary"
        flex={1}
        style={{ paddingBottom: bottom + theme.spacing[5] }}
      >
        <AnimatedHeaderScreenWithKeyboardLayout
          // hidden until linked: https://linear.app/leather-io/issue/LEA-1916
          // rightTitleElement={<MoreInfoIcon onPress={() => {}} />}
          title={t({ id: 'recover_wallet.title', message: 'Enter your secret key' })}
        >
          <Box gap="3">
            <Text variant="label01">
              {t({
                id: 'recover_wallet.subtitle',
                message: 'Paste or type a Secret Key to add its associated wallet.',
              })}
            </Text>
          </Box>
          <Box mb="3">
            {!hidePasteButton && (
              <Button
                onPress={pasteFromClipboard}
                style={{ position: 'absolute', bottom: 12, right: 12, zIndex: 20 }}
                buttonState="default"
                title={t({
                  id: 'recover_wallet.paste_button',
                  message: 'Paste',
                })}
                icon={<NoteEmptyIcon color={theme.colors['ink.background-primary']} />}
              />
            )}
            <TextInput
              textVariant="label01"
              onBlur={validateMnemonicOnBlur}
              inputRef={inputRef}
              mt="5"
              value={recoveryMnemonic}
              errorMessage={errorMessage}
              onChangeText={onChangeText}
              placeholder={t({
                id: 'recover_wallet.input_placeholder',
                message: 'Type your recovery phrase',
              })}
              inputState={inputState}
              height={172}
              multiline
              blurOnSubmit
              autoCapitalize="none"
              textAlignVertical="top"
              autoCorrect
              testID={TestId.restoreWalletTextInput}
            />
          </Box>

          <Accordion
            label={t({
              id: 'recover_wallet.accordion_label',
              message: 'Advanced options',
            })}
            content={
              <Box mx="-5">
                <Cell.Root
                  pressable
                  onPress={() => {
                    recoverWalletSheetRef.current?.present();
                  }}
                >
                  <Cell.Icon>
                    <Box
                      flexDirection="row"
                      p="3"
                      bg="ink.background-secondary"
                      borderRadius="round"
                    >
                      <LockIcon color={theme.colors['ink.text-primary']} />
                    </Box>
                  </Cell.Icon>
                  <Cell.Content>
                    <Cell.Label variant="primary">
                      {t({
                        id: 'recover_wallet.passphrase_label',
                        message: 'BIP39 passphrase',
                      })}
                    </Cell.Label>
                    <Cell.Label variant="primary">
                      {passphrase
                        ? t({
                            id: 'recover_wallet.passphrase_enabled',
                            message: 'Enabled',
                          })
                        : t({
                            id: 'recover_wallet.passphrase_disabled',
                            message: 'Disabled',
                          })}
                    </Cell.Label>
                  </Cell.Content>
                  <Cell.Aside>
                    <ChevronRightIcon variant="small" />
                  </Cell.Aside>
                </Cell.Root>
              </Box>
            }
          />
        </AnimatedHeaderScreenWithKeyboardLayout>
        <Button
          mx="5"
          onPress={onSubmit}
          disabled={isButtonDisabled}
          buttonState={isButtonDisabled ? 'disabled' : 'default'}
          title={t({
            id: 'recover_wallet.button',
            message: 'Continue',
          })}
          testID={TestId.restoreWalletContinue}
        />
      </Box>
      <RecoverWalletSheet
        setPassphrase={setPassphrase}
        passphrase={passphrase}
        recoverWalletSheetRef={recoverWalletSheetRef}
      />
    </>
  );
}
