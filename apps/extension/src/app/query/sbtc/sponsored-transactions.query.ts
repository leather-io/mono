import { type StacksTransactionWire } from '@stacks/transactions';
import axios from 'axios';

import {
  type StacksUnsignedTransactionOptions,
  generateStacksUnsignedTransaction,
} from '@leather.io/stacks';
import { createMoney } from '@leather.io/utils';

import { logger } from '@shared/logger';

import { queryClient } from '@app/common/persistence';

export interface TransactionBase {
  options?: StacksUnsignedTransactionOptions;
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
    const sponsoredTx = await generateStacksUnsignedTransaction({
      ...options,
      sponsored: true,
      fee: createMoney(fee, 'STX'),
      nonce: nonce ?? options.nonce,
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
