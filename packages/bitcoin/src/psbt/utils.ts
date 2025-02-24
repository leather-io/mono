import { hexToBytes } from '@noble/hashes/utils';
import * as btc from '@scure/btc-signer';
import { RawPSBTV0, RawPSBTV2 } from '@scure/btc-signer/psbt';

import { isString } from '@leather.io/utils';

export type RawPsbt = ReturnType<typeof RawPSBTV0.decode>;

export function getPsbtAsTransaction(psbt: string | Uint8Array) {
  const bytes = isString(psbt) ? hexToBytes(psbt) : psbt;
  return btc.Transaction.fromPSBT(bytes);
}

export function getRawPsbt(psbt: string | Uint8Array): ReturnType<typeof RawPSBTV0.decode> {
  const bytes = isString(psbt) ? hexToBytes(psbt) : psbt;
  try {
    return RawPSBTV0.decode(bytes);
  } catch (e1) {
    try {
      return RawPSBTV2.decode(bytes);
    } catch (e2) {
      throw new Error(`Unable to decode PSBT, ${e1 ?? e2}`);
    }
  }
}
