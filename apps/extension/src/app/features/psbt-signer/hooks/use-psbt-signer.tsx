import { useMemo } from 'react';

import { hexToBytes } from '@noble/hashes/utils';
import * as btc from '@scure/btc-signer';
import { RawPSBTV0, RawPSBTV2 } from '@scure/btc-signer/psbt';

import { isString } from '@leather.io/utils';

import { type BitcoinInputSigningConfig } from '@shared/crypto/bitcoin/signer-config';
import { logger } from '@shared/logger';

import {
  useAddTapInternalKeysIfMissing,
  useSignBitcoinTx,
} from '@app/store/accounts/blockchain/bitcoin/bitcoin.hooks';

export type RawPsbt = ReturnType<typeof RawPSBTV0.decode>;

interface SignPsbtArgs {
  allowedSighash?: number[];
  signingConfig: BitcoinInputSigningConfig[];
  tx: btc.Transaction;
}
export function usePsbtSigner() {
  const addMissingTapInteralKeys = useAddTapInternalKeysIfMissing();
  const signBitcoinTx = useSignBitcoinTx();

  return useMemo(
    () => ({
      async signPsbt(this: void, { allowedSighash, signingConfig, tx }: SignPsbtArgs) {
        addMissingTapInteralKeys(tx, signingConfig);
        return signBitcoinTx(tx.toPSBT(), signingConfig, allowedSighash);
      },
      getPsbtAsTransaction(this: void, psbt: string | Uint8Array) {
        const bytes = isString(psbt) ? hexToBytes(psbt) : psbt;
        return btc.Transaction.fromPSBT(bytes);
      },
      getRawPsbt(this: void, psbt: string | Uint8Array) {
        const bytes = isString(psbt) ? hexToBytes(psbt) : psbt;
        try {
          return RawPSBTV0.decode(bytes);
        } catch (e1) {
          logger.error(`Unable to decode PSBT as v0, trying v2, ${String(e1)}`);
          try {
            return RawPSBTV2.decode(bytes);
          } catch (e2) {
            throw new Error(`Unable to decode PSBT, ${String(e1 ?? e2)}`);
          }
        }
      },
    }),
    [addMissingTapInteralKeys, signBitcoinTx]
  );
}
