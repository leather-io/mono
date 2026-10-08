import type * as btc from '@scure/btc-signer';
import type * as bitcoin from 'bitcoinjs-lib';

import { signBip322MessageSimple } from '@leather.io/bitcoin';

type SignBip322MessageSimpleArgs = Parameters<typeof signBip322MessageSimple>[0];

interface SignBip322MessageUnlessDismissedArgs
  extends Omit<SignBip322MessageSimpleArgs, 'signPsbt'> {
  signPsbt(psbt: bitcoin.Psbt): Promise<btc.Transaction | null>;
}

class SigningDismissedError extends Error {}

export async function signBip322MessageUnlessDismissed({
  signPsbt,
  ...args
}: SignBip322MessageUnlessDismissedArgs) {
  try {
    return await signBip322MessageSimple({
      ...args,
      async signPsbt(psbt) {
        const signedTx = await signPsbt(psbt);
        if (!signedTx) throw new SigningDismissedError();
        return signedTx;
      },
    });
  } catch (error) {
    if (error instanceof SigningDismissedError) return null;
    throw error;
  }
}
