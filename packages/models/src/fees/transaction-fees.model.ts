import { Money } from '../money.model';
import { Blockchain } from '../types';
import { OwnedUtxo } from '../utxo.model';

export const transactionFeeTiers = ['low', 'standard', 'high'] as const;
export type TransactionFeeTier = (typeof transactionFeeTiers)[number];

export interface CoinSelectionOutput {
  value: bigint;
  address?: string;
}

export interface TransactionFees {
  readonly chain: Blockchain;
  readonly options: Record<TransactionFeeTier, TransactionFeeQuote>;
}

export const transactionFeeQuoteType = [
  'flat',
  'bitcoinFeeRate',
  'stacksFeeRate',
  'evm1559',
] as const;
export type TransactionFeeQuoteType = (typeof transactionFeeQuoteType)[number];

export interface BaseTransactionFeeQuote {
  readonly type: TransactionFeeQuoteType;
  readonly value: Money;
}

export interface FlatTransactionFeeQuote extends BaseTransactionFeeQuote {
  readonly type: 'flat';
}

export interface BitcoinTransactionFeeQuote extends BaseTransactionFeeQuote {
  readonly type: 'bitcoinFeeRate';
  readonly rate: number;
  readonly rateUnit: 'sats/vB';
  readonly estimatedTxSize: number;
  readonly sizeUnit: 'vB';
  readonly inputs: OwnedUtxo[];
  readonly outputs: CoinSelectionOutput[];
}

export interface StacksTransactionFeeQuote extends BaseTransactionFeeQuote {
  readonly type: 'stacksFeeRate';
  readonly rate: number;
  readonly rateUnit: 'µSTX/byte';
  readonly estimatedTxSize: number;
  readonly sizeUnit: 'byte';
}

export interface EvmTransactionFeeQuote extends BaseTransactionFeeQuote {
  readonly type: 'evm1559';
  readonly baseFeePerGas: Money;
  readonly priorityFeePerGas: Money;
  readonly gasLimit: number;
}

export type TransactionFeeQuote =
  | FlatTransactionFeeQuote
  | BitcoinTransactionFeeQuote
  | StacksTransactionFeeQuote
  | EvmTransactionFeeQuote;
