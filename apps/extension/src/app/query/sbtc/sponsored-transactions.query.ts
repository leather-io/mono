import { type StacksTransactionWire } from '@stacks/transactions';
import axios from 'axios';

import { logger } from '@shared/logger';

import { queryClient } from '@app/common/persistence';
import {
  type GenerateUnsignedTransactionOptions,
  generateUnsignedTransaction,
} from '@app/common/transactions/stacks/generate-unsigned-txs';

export interface TransactionBase {
  options?: GenerateUnsignedTransactionOptions;
  transaction: StacksTransactionWire | undefined;
}

export interface SbtcSponsorshipEligibility {
  isEligible: boolean;
  unsignedSponsoredTx?: StacksTransactionWire;
}

export interface SbtcSponsorshipVerificationResult {
  isVerifying: boolean;
  result: SbtcSponsorshipEligibility | undefined;
}

interface VerifySponsoredSbtcTransactionArgs {
  apiUrl: string;
  baseTx: TransactionBase;
  nonce?: number;
  fee: number;
}
export async function verifySponsoredSbtcTransaction({
  apiUrl,
  baseTx,
  nonce,
  fee,
}: VerifySponsoredSbtcTransactionArgs): Promise<SbtcSponsorshipEligibility> {
  try {
    const { options } = baseTx;
    if (!options) throw new Error('Missing transaction options');
    options.txData.sponsored = true;
    const sponsoredTx = await generateUnsignedTransaction({
      ...options,
      fee,
      nonce,
    });
    const serializedTx = sponsoredTx.serialize();

    const result = await queryClient.fetchQuery({
      queryKey: ['verify-sponsored-sbtc-transaction', apiUrl, serializedTx],
      async queryFn() {
        const { data } = await axios.post<boolean>(
          `${apiUrl}/verify`,
          {
            tx: serializedTx,
          },
          { timeout: 5000 }
        );
        return data;
      },
    });

    return { isEligible: result, unsignedSponsoredTx: sponsoredTx };
  } catch (error) {
    logger.error('Transaction verification failed:', error);
    return { isEligible: false };
  }
}
