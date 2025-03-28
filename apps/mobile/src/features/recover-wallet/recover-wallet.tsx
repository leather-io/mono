import { useEffect, useReducer, useRef } from 'react';
import { Keyboard, TextInput as RNTextInput } from 'react-native';

import { TextInput } from '@/components/text-input';
import { useCreateWallet } from '@/hooks/use-create-wallet';
import { TestId } from '@/shared/test-id';
import { tempMnemonicStore } from '@/store/storage-persistors';
import { t } from '@lingui/macro';
import * as Clipboard from 'expo-clipboard';

import { isValidMnemonic } from '@leather.io/crypto';
import { Box, Button, NoteEmptyIcon } from '@leather.io/ui/native';

import {
  clearError,
  setButtonDisabled,
  setError,
  setPassphrase,
  setRecoveryMnemonic,
} from './actions';
import { constructErrorMessage } from './components/error-message';
import { RecoverWalletLayout } from './recover-wallet.layout';
import { initialState, reducer } from './reducer';
import { getInvalidMnemonicWords } from './utils';

export function RecoverWallet() {
  const inputRef = useRef<RNTextInput>(null);
  const { navigateAndCreateWallet } = useCreateWallet();

  const [state, dispatch] = useReducer(reducer, initialState);
  const { recoveryMnemonic, inputState, errorMessage, isButtonDisabled, passphrase } = state;
  const hidePasteButton = recoveryMnemonic.length > 0;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function validateMnemonicOnBlur() {
    const invalidWords = getInvalidMnemonicWords(recoveryMnemonic);
    const isError = invalidWords.length !== 0;
    if (recoveryMnemonic.length > 0 && isError) {
      dispatch(setError(constructErrorMessage(invalidWords)));
    } else {
      dispatch(clearError());
    }
  }

  function checkMnemonic(text: string) {
    const isValid = isValidMnemonic(text);
    if (isValid) {
      dispatch(setButtonDisabled(false));
    } else {
      dispatch(setButtonDisabled(true));
    }
  }

  async function onChangeText(text: string) {
    const textChangeAmount = Math.abs(recoveryMnemonic.length - text.length);
    // If the user has entered multiple characters - infer native paste
    const mnemonic = textChangeAmount <= 1 ? text : text.trim();
    checkMnemonic(mnemonic);
    dispatch(setRecoveryMnemonic(mnemonic));

    const copiedString = await Clipboard.getStringAsync();
    if (mnemonic === copiedString.trim()) {
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
    Keyboard.dismiss();
    const copiedString = await Clipboard.getStringAsync();
    const cleanedString = copiedString.trim();
    dispatch(setRecoveryMnemonic(cleanedString));
    checkMnemonic(cleanedString);
    inputRef.current?.focus();
  }

  return (
    <RecoverWalletLayout
      passphrase={passphrase}
      isButtonDisabled={isButtonDisabled}
      onSubmit={onSubmit}
      setPassphrase={passphrase => dispatch(setPassphrase(passphrase))}
    >
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
            icon={<NoteEmptyIcon color="ink.background-primary" />}
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
    </RecoverWalletLayout>
  );
}
