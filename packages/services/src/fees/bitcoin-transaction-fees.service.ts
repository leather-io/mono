import { injectable } from 'inversify';

import { CoinSelectionRecipient } from '@leather.io/bitcoin';
import { TransactionFees } from '@leather.io/models';

import { BitcoinCoinSelectionService } from '../coin-selection/bitcoin-coin-selection.service';
import { LeatherApiClient } from '../infrastructure/api/leather/leather-api.client';
import { AccountRequest } from '../types';
import { createBitcoinTransactionFeeQuote } from './bitcoin-transaction-fees.utils';

@injectable()
export class BitcoinTransactionFeesService {
  constructor(
    private readonly leatherApiClient: LeatherApiClient,
    private readonly coinSelectionService: BitcoinCoinSelectionService
  ) {}

  async getBitcoinTransactionFees(
    account: AccountRequest,
    recipients: CoinSelectionRecipient[],
    isMaxSpend = false,
    signal?: AbortSignal
  ): Promise<TransactionFees> {
    const feeRates = await this.leatherApiClient.fetchBitcoinFeeRates({ signal });

    const [
      { fee: lowFee, estimatedTxSize: lowTxVBytes, inputs: lowInputs, outputs: lowOutputs },
      {
        fee: standardFee,
        estimatedTxSize: standardTxVBytes,
        inputs: standardInputs,
        outputs: standardOutputs,
      },
      { fee: highFee, estimatedTxSize: highTxVBytes, inputs: highInputs, outputs: highOutputs },
    ] = await Promise.all([
      this.coinSelectionService.performCoinSelection({
        account,
        recipients,
        isMaxSpend,
        feeRate: feeRates.low.rate,
      }),
      this.coinSelectionService.performCoinSelection({
        account,
        recipients,
        isMaxSpend,
        feeRate: feeRates.standard.rate,
      }),
      this.coinSelectionService.performCoinSelection({
        account,
        recipients,
        isMaxSpend,
        feeRate: feeRates.high.rate,
      }),
    ]);
    return await Promise.resolve({
      chain: 'bitcoin',
      options: {
        low: createBitcoinTransactionFeeQuote(
          lowFee,
          feeRates.low.rate,
          lowTxVBytes,
          lowInputs,
          lowOutputs
        ),
        standard: createBitcoinTransactionFeeQuote(
          standardFee,
          feeRates.standard.rate,
          standardTxVBytes,
          standardInputs,
          standardOutputs
        ),
        high: createBitcoinTransactionFeeQuote(
          highFee,
          feeRates.high.rate,
          highTxVBytes,
          highInputs,
          highOutputs
        ),
      },
    });
  }
}
