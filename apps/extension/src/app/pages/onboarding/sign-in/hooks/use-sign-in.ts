import { useCallback, useEffect, useRef, useState } from 'react';

import { validateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';

import { getMnemonicRootKeyFingerprint } from '@leather.io/crypto';
import { delay } from '@leather.io/utils';

import { analytics } from '@shared/utils/analytics';

import { useLoading } from '@app/store/ui/ui.hooks';
import { getAddWalletError, useWalletEntities } from '@app/store/wallets/wallet.selectors';

async function simulateShortDelayToAvoidImmediateNavigation() {
  await delay(600);
}

export function useSignIn() {
  const [error, setError] = useState<string | undefined>();
  const [isKeyMasked, setIsKeyMasked] = useState(true);
  const [mnemonicData, setMnemonicData] = useState<null | {
    mnemonic: string;
    fingerprint: string;
  }>(null);

  const { isLoading, setIsLoading, setIsIdle } = useLoading('useSignIn');

  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  const walletEntities = useWalletEntities();

  const handleSetError = useCallback(
    (
      message = 'Incorrect Secret Key. Make sure it is 12 or 24 words with spaces between words.'
    ) => {
      setError(message);
      setIsIdle();
      analytics.track('submit_invalid_secret_key');
      return;
    },
    [setError, setIsIdle]
  );

  const submitMnemonicForm = useCallback(
    async (passedValue: string) => {
      setIsLoading();
      const parsedKeyInput = passedValue ? passedValue.trim() : '';

      // empty?
      if (parsedKeyInput.length === 0) {
        handleSetError('Entering your Secret Key is required.');
        return;
      }

      if (!validateMnemonic(parsedKeyInput, wordlist)) {
        handleSetError();
        return;
      }

      await simulateShortDelayToAvoidImmediateNavigation();

      const fingerprint = getMnemonicRootKeyFingerprint(parsedKeyInput);
      const addWalletError = getAddWalletError(walletEntities, fingerprint, 'software');
      if (addWalletError) {
        setError(addWalletError);
        setIsIdle();
        return;
      }
      setMnemonicData({ mnemonic: parsedKeyInput, fingerprint });
      analytics.track('submit_valid_secret_key');
      setIsIdle();
    },
    [setIsLoading, setIsIdle, handleSetError, walletEntities]
  );

  const toggleKeyMask = useCallback(() => {
    setIsKeyMasked(prev => !prev);
  }, []);

  useEffect(
    () => () => {
      setError(undefined);
      setIsIdle();
    },
    // setIsIdle update change not desired
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setError]
  );

  return {
    submitMnemonicForm,
    ref: textAreaRef,
    error,
    isLoading,
    toggleKeyMask,
    isKeyMasked,
    mnemonicData,
  };
}
