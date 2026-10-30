import { isTaprootDerivationPath } from '@leather.io/bitcoin';
import { extractAddressIndexFromPath, extractChangeIndexFromPath } from '@leather.io/crypto';
import type { HardwareBitcoinInputToSign } from '@leather.io/ledger';

import type { BitcoinInputSigningConfig } from '@shared/crypto/bitcoin/signer-config';

import { useCurrentAccountNativeSegwitPayer } from './native-segwit-account.hooks';
import { useCurrentAccountTaprootPayer } from './taproot-account.hooks';

export function useHardwareBitcoinInputsToSign() {
  const createNativeSegwitPayer = useCurrentAccountNativeSegwitPayer();
  const createTaprootPayer = useCurrentAccountTaprootPayer();

  function publicKeyForPath(derivationPath: string): Uint8Array {
    const indexes = {
      changeIndex: extractChangeIndexFromPath(derivationPath),
      addressIndex: extractAddressIndexFromPath(derivationPath),
    };
    const payer = isTaprootDerivationPath(derivationPath)
      ? createTaprootPayer?.(indexes)
      : createNativeSegwitPayer?.(indexes);
    if (!payer) throw new Error(`Unable to find the signing key for path ${derivationPath}`);
    return payer.publicKey;
  }

  return (signingConfig: BitcoinInputSigningConfig[]): HardwareBitcoinInputToSign[] =>
    signingConfig.map(({ index, derivationPath }) => ({
      index,
      derivationPath,
      publicKey: publicKeyForPath(derivationPath),
    }));
}
