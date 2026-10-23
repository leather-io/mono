import { StacksTransactionWire } from '@stacks/transactions';
import { injectable } from 'inversify';

import { type StacksTransactionFees, TransactionFeeTier } from '@leather.io/models';
import {
  estimateStacksTransactionByteLength,
  getSerializedUnsignedStacksTxPayload,
} from '@leather.io/stacks';
import { createMoney } from '@leather.io/utils';

import { HiroStacksApiClient } from '../infrastructure/api/hiro/hiro-stacks-api.client';
import {
  AppConfigService,
  type StacksFeeConfig,
} from '../infrastructure/app-config/app-config.service';
import {
  createStacksTransactionFeeQuote,
  getStacksMinimumFeeAmount,
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
    signerCount?: number,
    signal?: AbortSignal
  ): Promise<StacksTransactionFees> {
    const estimatedTxSize = estimateStacksTransactionByteLength(unsignedTx, signerCount);
    const config = await this.appConfigService.getStacksTransactionFeeConfig(signal);
    const fees = await this.getTieredFeeAmounts(unsignedTx, estimatedTxSize, config, signal);
    return {
      chain: 'stacks',
      minimumFee: createMoney(getStacksMinimumFeeAmount(estimatedTxSize, config), 'STX'),
      highFeeThreshold: createMoney(config.globalMaximumFee, 'STX'),
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
    config: StacksFeeConfig,
    signal?: AbortSignal
  ): Promise<Record<TransactionFeeTier, number>> {
    try {
      const apiEstimates = await this.stacksApiClient.getTransactionFeeEstimate(
        getSerializedUnsignedStacksTxPayload(unsignedTx),
        estimatedTxSize,
        { signal }
      );
      return getStacksTxFeeBoundedEstimates(apiEstimates, estimatedTxSize, unsignedTx, config);
    } catch {
      return getStacksTxFeeDefaultAmounts(unsignedTx, config, estimatedTxSize);
    }
  }
}
