import { useCallback } from 'react';

import {
  BitcoinPayer,
  isNativeSegwitDerivationPath,
  isTaprootDerivationPath,
} from '@leather.io/bitcoin';
import { extractAddressIndexFromPath, extractChangeIndexFromPath } from '@leather.io/crypto';
import type { OwnedUtxo } from '@leather.io/models';

import { useCurrentAccountNativeSegwitPayer } from './native-segwit-account.hooks';
import { useCurrentAccountTaprootPayer } from './taproot-account.hooks';

export function useBitcoinPayerFromInput() {
  const createNativeSegwitSigner = useCurrentAccountNativeSegwitPayer();
  const createTaprootSigner = useCurrentAccountTaprootPayer();

  return useCallback(
    (input: OwnedUtxo): BitcoinPayer => {
      const addressIndex = extractAddressIndexFromPath(input.path);
      const changeIndex = extractChangeIndexFromPath(input.path);

      if (isNativeSegwitDerivationPath(input.path)) {
        const nativeSegwitSigner = createNativeSegwitSigner?.({ changeIndex, addressIndex });
        if (nativeSegwitSigner) return nativeSegwitSigner;
      }

      if (isTaprootDerivationPath(input.path)) {
        const taprootSigner = createTaprootSigner?.({ changeIndex, addressIndex });
        if (taprootSigner) return taprootSigner;
      }

      throw new Error(`No signer found for input at path: ${input.path}`);
    },
    [createNativeSegwitSigner, createTaprootSigner]
  );
}
