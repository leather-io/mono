import { mnemonicStore } from '@/store/storage-persistors';
import * as btc from '@scure/btc-signer';

import { extractRequiredKeyOrigins, getPsbtTxInputs } from '@leather.io/bitcoin';
import {
  deriveChildKeychainFromMnemnonic,
  extractFingerprintFromKeyOriginPath,
} from '@leather.io/crypto';
import { isDefined, uniqueArray } from '@leather.io/utils';

export function usePsbtSigner() {
  return {
    async sign(tx: Uint8Array) {
      const unsignedTx = btc.Transaction.fromPSBT(tx);

      const inputs = getPsbtTxInputs(unsignedTx);

      // This step is an important difference to extension, where we pass around
      // a signing config. Here we use the PSBT spec to define the origin of the
      // key. The library formats this different, so here we extract to the
      // format we use here key origin (fingerprint/derivation path)
      // const requiredPaths = ["efd01538/86'/0'/0'/0/0"];
      const requiredPaths = uniqueArray(
        inputs
          .flatMap(input =>
            extractRequiredKeyOrigins(input.bip32Derivation ?? input.tapBip32Derivation ?? [])
          )
          .filter(isDefined)
      );

      const masterKeyFingerprints = uniqueArray(
        requiredPaths.map(path => extractFingerprintFromKeyOriginPath(path))
      );

      // Assuming for now users are only signing keys from the same master key.
      // Signing from many keys probably isn't a likely use-case for v1, and
      // we'll need to change implementation of mnemonicStore to read many items
      // at once  without triggering successive biometric prompts
      if (masterKeyFingerprints.length > 1) throw new Error('Unimplemented: Multiple key origins');

      const rootKeyFingerprint = masterKeyFingerprints[0];

      if (!rootKeyFingerprint) throw new Error('No master key found');

      const { mnemonic, passphrase } = await mnemonicStore(rootKeyFingerprint).getMnemonic();

      const privateKeychains = await Promise.all(
        requiredPaths.map(path =>
          deriveChildKeychainFromMnemnonic(path, mnemonic, passphrase).then(
            keychain => [path, keychain] as const
          )
        )
      );

      const pkMap = Object.fromEntries(privateKeychains);

      inputs.forEach((input, index) => {
        const keys = extractRequiredKeyOrigins(
          input.bip32Derivation ?? input.tapBip32Derivation ?? []
        );

        const key = keys[0];

        if (!key || keys.length !== 1) throw new Error('Unimplemented: Multisig transactions');

        try {
          unsignedTx.signIdx(pkMap[key]!.privateKey!, index);
        } catch (e) {
          // eslint-disable-next-line no-console
          console.log(e);
        }
      });

      return unsignedTx;
    },
  };
}
