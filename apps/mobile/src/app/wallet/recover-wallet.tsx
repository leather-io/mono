import { useRef, useState } from 'react';
import { TextInput as RNTextInput } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RecoverWalletSheet } from '@/components/recover-wallet/recover-wallet-sheet';
import { InputState, TextInput } from '@/components/text-input';
import { useCreateWallet } from '@/hooks/create-wallet';
import { tempMnemonicStore } from '@/store/storage-persistors';
import { Trans, t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';
import * as Clipboard from 'expo-clipboard';

import { isValidMnemonic, isValidMnemonicWord } from '@leather.io/crypto';
import {
  Box,
  Button,
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  LockIcon,
  NoteEmptyIcon,
  QuestionCircleIcon,
  SheetRef,
  Text,
  Theme,
  TouchableOpacity,
} from '@leather.io/ui/native';

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
  const [recoveryMnemonic, setRecoveryMnemonic] = useState('');
  const inputRef = useRef<RNTextInput>(null);
  const [inputState, setInputState] = useState<InputState>('default');
  const [errorMessage, setErrorMessage] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
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

  function onChangeText(text: string) {
    checkMnemonic(text);
    setRecoveryMnemonic(text);
    setInputState('default');
  }

  async function onSubmit() {
    const isValid = isValidMnemonic(recoveryMnemonic);
    if (isValid) {
      await tempMnemonicStore.setTemporaryMnemonic(recoveryMnemonic, passphrase);
      navigateAndCreateWallet();
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

  return (
    <>
      <Box
        flex={1}
        backgroundColor="ink.background-primary"
        style={{ paddingBottom: bottom + theme.spacing['5'] }}
      >
        <KeyboardAwareScrollView contentContainerStyle={{ paddingHorizontal: theme.spacing['5'] }}>
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
                <Text variant="heading03">ENTER YOUR</Text>
                <Text variant="heading03">SECRET KEY</Text>
              </Trans>
            </Box>
            <Text variant="label01">{t`Paste or type a Secret Key to add its associated wallet.`}</Text>
          </Box>
          <Box mb="3">
            {!hidePasteButton && (
              <Button
                onPress={pasteFromClipboard}
                style={{ position: 'absolute', bottom: 12, right: 12, zIndex: 100 }}
                buttonState="default"
                title={t`Paste`}
                icon={<NoteEmptyIcon color={theme.colors['ink.background-primary']} />}
              />
            )}
            <TextInput
              textVariant="label01"
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
            {showAdvancedOptions ? (
              <ChevronUpIcon color={theme.colors['ink.text-primary']} variant="small" />
            ) : (
              <ChevronDownIcon color={theme.colors['ink.text-primary']} variant="small" />
            )}
          </TouchableOpacity>
          {!showAdvancedOptions ? null : (
            <TouchableOpacity
              onPress={() => {
                recoverWalletSheetRef.current?.present();
              }}
              pt="3"
              pb="5"
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box flexDirection="row" gap="4">
                <Box flexDirection="row" p="2" bg="ink.background-secondary" borderRadius="round">
                  <LockIcon color={theme.colors['ink.text-primary']} />
                </Box>
                <Box flexDirection="column">
                  <Text variant="label02">{t`BIP39 passphrase`}</Text>
                  <Text color="ink.text-subdued" variant="label03">
                    {passphrase ? t`Enabled` : t`Disabled`}
                  </Text>
                </Box>
              </Box>
              <ChevronRightIcon color={theme.colors['ink.text-primary']} variant="small" />
            </TouchableOpacity>
          )}
        </KeyboardAwareScrollView>
        <Button
          mx="5"
          onPress={onSubmit}
          disabled={isButtonDisabled}
          buttonState={isButtonDisabled ? 'disabled' : 'default'}
          title={t`Continue`}
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
