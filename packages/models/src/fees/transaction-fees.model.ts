import { Money } from '../money.model';
import { Blockchain } from '../types';

export const transactionFeeTiers = ['low', 'standard', 'high'] as const;
export type TransactionFeeTier = (typeof transactionFeeTiers)[number];

export interface TransactionFees {
  readonly chain: Blockchain;
  readonly options: Record<TransactionFeeTier, TransactionFeeQuote>;
}

export const transactionFeeQuoteType = ['flat', 'feeRate', 'evm1559'] as const;
export type TransactionFeeQuoteType = (typeof transactionFeeQuoteType)[number];

export interface BaseTransactionFeeQuote {
  readonly type: TransactionFeeQuoteType;
  readonly value: Money;
}

export interface FlatTransactionFeeQuote extends BaseTransactionFeeQuote {
  readonly type: 'flat';
}

export interface FeeRateTransactionFeeQuote extends BaseTransactionFeeQuote {
  readonly type: 'feeRate';
  readonly rate: number;
  readonly rateUnit: 'sats/vB' | 'µSTX/byte';
  readonly estimatedTxSize: number;
  readonly sizeUnit: 'vB' | 'byte';
}

export interface EvmTransactionFeeQuote extends BaseTransactionFeeQuote {
  readonly type: 'evm1559';
  readonly baseFeePerGas: Money;
  readonly priorityFeePerGas: Money;
  readonly gasLimit: number;
}

export type TransactionFeeQuote =
  | FlatTransactionFeeQuote
  | FeeRateTransactionFeeQuote
  | EvmTransactionFeeQuote;
