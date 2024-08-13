import { useRef, useState } from 'react';
import { TextInput as RNTextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ChevronDown from '@/assets/chevron-down.svg';
import ChevronRight from '@/assets/chevron-right.svg';
import ChevronUp from '@/assets/chevron-up.svg';
import CircleQuestionMark from '@/assets/circle-questionmark.svg';
import Lock from '@/assets/lock.svg';
import Note from '@/assets/note-2.svg';
import { Button } from '@/components/button';
import { RecoverWalletModal } from '@/components/recover-wallet/recover-wallet-modal';
import { InputState, TextInput } from '@/components/text-input';
import { APP_ROUTES } from '@/constants';
import { tempMnemonicStore } from '@/state/storage-persistors';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';

import { isValidMnemonic, isValidMnemonicWord } from '@leather.io/crypto';
import { Box, Text, Theme, TouchableOpacity } from '@leather.io/ui/native';

function constructErrorMessage(invalidWords: string[]) {
  const joinedInvalidWords = invalidWords.join(', ');
  return t`Invalid words: ${joinedInvalidWords}`;
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
  const router = useRouter();
  const [recoveryMnemonic, setRecoveryMnemonic] = useState('');
  const inputRef = useRef<RNTextInput>(null);
  const [inputState, setInputState] = useState<InputState>('default');
  const [errorMessage, setErrorMessage] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const recoverWalletModalRef = useRef<BottomSheetModal>(null);
  const [passphrase, setPassphrase] = useState('');

  function validateMnemonicOnBlur() {
    const invalidWords = getInvalidMnemonicWords(recoveryMnemonic);
    const isError = invalidWords.length !== 0;
    if (isError) {
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

  function onChangeText(text: string) {
    checkMnemonic(text);
    setRecoveryMnemonic(text);
    setInputState('default');
  }

  async function onSubmit() {
    const isValid = isValidMnemonic(recoveryMnemonic);
    if (isValid) {
      await tempMnemonicStore.setTemporaryMnemonic(recoveryMnemonic, passphrase);
      router.navigate(APP_ROUTES.WalletSecureYourWallet);
    }
  }

  async function pasteFromClipboard() {
    const copiedString = await Clipboard.getStringAsync();
    setRecoveryMnemonic(copiedString);
    checkMnemonic(copiedString);
    inputRef.current?.focus();
  }

  function toggleAdvancedOptions() {
    setShowAdvancedOptions(!showAdvancedOptions);
  }

  const ToggledChevron = showAdvancedOptions ? ChevronUp : ChevronDown;

  return (
    <>
      <Box
        flex={1}
        backgroundColor="ink.background-primary"
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
              <CircleQuestionMark height={16} width={16} color={theme.colors['ink.text-primary']} />
            </TouchableOpacity>
            <Text variant="heading03">{t`ENTER YOUR SECRET KEY`}</Text>
            <Text variant="label01">{t`Paste or type a Secret Key to add its associated wallet.`}</Text>
          </Box>
          <Box mb="3">
            <Button
              onPress={pasteFromClipboard}
              style={{ position: 'absolute', bottom: 12, right: 12, zIndex: 100 }}
              buttonState="default"
              title={t`Paste`}
              Icon={Note}
            />
            <TextInput
              onBlur={validateMnemonicOnBlur}
              ref={inputRef}
              mt="5"
              value={recoveryMnemonic}
              errorMessage={errorMessage}
              onChangeText={onChangeText}
              placeholder={t`Type your recovery phrase`}
              inputState={inputState}
              height={220}
              multiline
              blurOnSubmit
              autoCapitalize="none"
              autoCorrect
            />
          </Box>
          <TouchableOpacity
            onPress={toggleAdvancedOptions}
            pt="5"
            pb="3"
            flexDirection="row"
            justifyContent="space-between"
          >
            <Text variant="label02">{t`Advanced options`}</Text>
            <ToggledChevron color={theme.colors['ink.text-primary']} height={16} width={16} />
          </TouchableOpacity>
          {!showAdvancedOptions ? null : (
            <TouchableOpacity
              onPress={() => {
                recoverWalletModalRef.current?.present();
              }}
              py="3"
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box flexDirection="row" gap="4">
                <Box flexDirection="row" p="2" bg="ink.background-secondary" borderRadius="round">
                  <Lock color={theme.colors['ink.text-primary']} width={24} height={24} />
                </Box>
                <Box flexDirection="column">
                  <Text variant="label02">{t`BIP39 passphrase`}</Text>
                  <Text color="ink.text-subdued" variant="label03">
                    {passphrase ? t`Enabled` : t`Disabled`}
                  </Text>
                </Box>
              </Box>
              <ChevronRight color={theme.colors['ink.text-primary']} width={16} height={16} />
            </TouchableOpacity>
          )}
        </Box>
        <Button
          onPress={onSubmit}
          disabled={isButtonDisabled}
          buttonState={isButtonDisabled ? 'disabled' : 'default'}
          title={t`Continue`}
        />
      </Box>
      <RecoverWalletModal
        setPassphrase={setPassphrase}
        passphrase={passphrase}
        recoverWalletModalRef={recoverWalletModalRef}
      />
    </>
  );
}
