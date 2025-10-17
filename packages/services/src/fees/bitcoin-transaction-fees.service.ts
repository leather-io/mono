import { injectable } from 'inversify';

import { CoinSelectionRecipient } from '@leather.io/bitcoin';
import { TransactionFees } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

@injectable()
export class BitcoinTransactionFeesService {
  async getBitcoinTransactionFees(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    recipients: CoinSelectionRecipient,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    signal?: AbortSignal
  ): Promise<TransactionFees> {
    return await Promise.resolve({
      chain: 'bitcoin',
      options: {
        low: {
          type: 'feeRate',
          rate: 1,
          rateUnit: 'sats/vB',
          estimatedTxSize: 101,
          sizeUnit: 'vB',
          value: createMoney(1, 'BTC'),
        },
        standard: {
          type: 'feeRate',
          rate: 2,
          rateUnit: 'sats/vB',
          estimatedTxSize: 102,
          sizeUnit: 'vB',
          value: createMoney(2, 'BTC'),
        },
        high: {
          type: 'feeRate',
          rate: 3,
          rateUnit: 'sats/vB',
          estimatedTxSize: 103,
          sizeUnit: 'vB',
          value: createMoney(3, 'BTC'),
        },
      },
    });
  }
}
