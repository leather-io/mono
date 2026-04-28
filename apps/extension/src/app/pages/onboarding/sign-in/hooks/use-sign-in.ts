import { useCallback, useEffect, useRef, useState } from 'react';

import { validateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';

import { getMnemonicRootKeyFingerprint } from '@leather.io/crypto';
import { resetWallet } from '@leather.io/state';
import { delay } from '@leather.io/utils';

import { analytics } from '@shared/utils/analytics';

import { useAppDispatch } from '@app/store';
import { walletKeyGenerated } from '@app/store/active/active.slice';
import * as inMemoryStore from '@app/store/in-memory-key/in-memory-storage';
import { useLoading } from '@app/store/ui/ui.hooks';

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

  const dispatch = useAppDispatch();

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
      }

      if (!validateMnemonic(parsedKeyInput, wordlist)) {
        handleSetError();
        return;
      }

      await simulateShortDelayToAvoidImmediateNavigation();

      dispatch(resetWallet());
      const fingerprint = getMnemonicRootKeyFingerprint(parsedKeyInput);
      inMemoryStore.setKey(fingerprint, parsedKeyInput);
      dispatch(walletKeyGenerated(fingerprint));
      analytics.track('submit_valid_secret_key');
      // void navigate(RouteUrls.SetPassword);
      setIsIdle();
    },
    [setIsLoading, dispatch, setIsIdle, handleSetError]
  );
  const submitMnemonicFormUpdated = useCallback(
    async (passedValue: string) => {
      setIsLoading();
      const parsedKeyInput = passedValue ? passedValue.trim() : '';

      // empty?
      if (parsedKeyInput.length === 0) {
        handleSetError('Entering your Secret Key is required.');
      }

      if (!validateMnemonic(parsedKeyInput, wordlist)) {
        handleSetError();
        return;
      }

      await simulateShortDelayToAvoidImmediateNavigation();

      const fingerprint = getMnemonicRootKeyFingerprint(parsedKeyInput);
      setMnemonicData({ mnemonic: passedValue, fingerprint });
      // dispatch(walletKeyGenerated(fingerprint));
      analytics.track('submit_valid_secret_key');
      // void navigate(RouteUrls.SetPassword);
      setIsIdle();
    },
    [setIsLoading, setIsIdle, handleSetError]
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
    submitMnemonicFormUpdated,
    ref: textAreaRef,
    error,
    isLoading,
    toggleKeyMask,
    isKeyMasked,
    mnemonicData,
  };
}
