import { useFormContext } from 'react-hook-form';

import { Pox4SignatureTopic } from '@stacks/stacking';
import BigNumber from 'bignumber.js';
import z from 'zod';
import { microStxToStxBigint } from '~/utils/unit-convert';

import { btcAddressValidator } from '@leather.io/bitcoin';

const maxU128BigInt = 340282366920938463463374607431768211455n;
export const maxU128Stx = new BigNumber(microStxToStxBigint(maxU128BigInt));
export const maxU128 = microStxToStxBigint(maxU128BigInt);

export const signerKeySignatureFormSchema = z.object({
  rewardCycle: z.coerce.number(),
  bitcoinRewardAddress: z.string().nonempty().and(btcAddressValidator()),
  method: z.string(),
  maxAmount: z.string(),
  authId: z.string(),
  duration: z.coerce.number(),
});

export type SignerKeySignatureForm = z.infer<typeof signerKeySignatureFormSchema>;

export const signerKeyDefaults: Partial<SignerKeySignatureForm> = {
  method: Pox4SignatureTopic.StackStx,
  maxAmount: maxU128BigInt.toString(),
  duration: 1,
};

export function useSignerKeyGenerationForm() {
  return useFormContext<SignerKeySignatureForm>();
}
