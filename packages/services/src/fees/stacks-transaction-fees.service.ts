import { StacksTransactionWire, estimateTransactionByteLength } from '@stacks/transactions';
import { injectable } from 'inversify';

import { type StacksTransactionFees, TransactionFeeTier } from '@leather.io/models';
import { getSerializedUnsignedStacksTxPayload } from '@leather.io/stacks';

import { HiroStacksApiClient } from '../infrastructure/api/hiro/hiro-stacks-api.client';
import { AppConfigService } from '../infrastructure/app-config/app-config.service';
import {
  createStacksTransactionFeeQuote,
  getStacksTxFeeBoundedEstimates,
  getStacksTxFeeDefaultAmounts,
} from './stacks-transaction-fees.utils';

@injectable()
export class StacksTransactionFeesService {
  constructor(
    private readonly stacksApiClient: HiroStacksApiClient,
    private readonly appConfigService: AppConfigService
  ) {}

  async getStacksTransactionFees(
    unsignedTx: StacksTransactionWire,
    signal?: AbortSignal
  ): Promise<StacksTransactionFees> {
    const estimatedTxSize = estimateTransactionByteLength(unsignedTx);
    const fees = await this.getTieredFeeAmounts(unsignedTx, estimatedTxSize, signal);
    return {
      chain: 'stacks',
      options: {
        low: createStacksTransactionFeeQuote(fees.low, estimatedTxSize),
        standard: createStacksTransactionFeeQuote(fees.standard, estimatedTxSize),
        high: createStacksTransactionFeeQuote(fees.high, estimatedTxSize),
      },
    };
  }

  private async getTieredFeeAmounts(
    unsignedTx: StacksTransactionWire,
    estimatedTxSize: number,
    signal?: AbortSignal
  ): Promise<Record<TransactionFeeTier, number>> {
    const config = await this.appConfigService.getStacksTransactionFeeConfig();
    try {
      const apiEstimates = await this.stacksApiClient.getTransactionFeeEstimate(
        getSerializedUnsignedStacksTxPayload(unsignedTx),
        estimatedTxSize,
        { signal }
      );
      return getStacksTxFeeBoundedEstimates(apiEstimates, estimatedTxSize, unsignedTx, config);
    } catch {
      return getStacksTxFeeDefaultAmounts(unsignedTx, config);
    }
  }
}
