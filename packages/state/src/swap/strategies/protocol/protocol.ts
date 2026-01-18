import BigNumber from 'bignumber.js';

import { BITCOIN_MINIMUM_SPEND_IN_SATS } from '@leather.io/constants';
import {
  type BitcoinTransactionFeeQuote,
  type CryptoAssetBalance,
  type Money,
  type TransactionFeeTier,
} from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

import { type FeeMode, type SwapDependencies } from '../../swap-state.types';
import { DUMMY_P2TR_RECIPIENT, STX_SAFETY_BUFFER } from '../../swap.constants';

export type SupportedProtocol = 'nativeBtc' | 'nativeStx' | 'sip10';

export interface SpendableAmountContext {
  balance: CryptoAssetBalance;
  dependencies: SwapDependencies;
  feeTier: TransactionFeeTier;
  customFee: number | null;
  signal: AbortSignal;
}

export interface ProtocolStrategy {
  resolveSpendableAmount(context: SpendableAmountContext): Promise<Money>;
  getMinimumSpendAmount(): number;
  getMaximumSpendAmount(): number;
  getFeeCapabilities(): FeeCapabilities;
}

export interface FeeCapabilities {
  mode: FeeMode;
  customFeeEnabled: boolean;
}

const nativeBtcStrategy: ProtocolStrategy = {
  async resolveSpendableAmount({
    dependencies,
    feeTier,
    customFee,
    signal,
  }: SpendableAmountContext): Promise<Money> {
    const { accountRequest, services } = dependencies;
    const { bitcoinTransactionFeesService, bitcoinCoinSelectionService } = services;

    const feeRate = await resolveFeeRate(
      customFee,
      feeTier,
      accountRequest,
      bitcoinTransactionFeesService,
      signal
    );

    const result = await bitcoinCoinSelectionService.calculateMaxSpend({
      account: accountRequest,
      recipient: DUMMY_P2TR_RECIPIENT,
      feeRate,
    });

    return result.amount;
  },
  getMinimumSpendAmount() {
    return BITCOIN_MINIMUM_SPEND_IN_SATS;
  },
  getMaximumSpendAmount() {
    return Number.POSITIVE_INFINITY;
  },
  getFeeCapabilities() {
    return {
      mode: 'tiered',
      customFeeEnabled: true,
    };
  },
};

const nativeStxStrategy: ProtocolStrategy = {
  resolveSpendableAmount({ balance }: SpendableAmountContext): Promise<Money> {
    const { amount, symbol, decimals } = balance.availableBalance;
    const spendableAmount = BigNumber.max(0, amount.minus(STX_SAFETY_BUFFER.amount));
    return Promise.resolve(createMoney(spendableAmount, symbol, decimals));
  },
  getMinimumSpendAmount() {
    return 0;
  },
  getMaximumSpendAmount() {
    return Number.POSITIVE_INFINITY;
  },
  getFeeCapabilities() {
    return {
      mode: 'tiered',
      customFeeEnabled: true,
    };
  },
};

const sip10Strategy: ProtocolStrategy = {
  resolveSpendableAmount({ balance }: SpendableAmountContext): Promise<Money> {
    return Promise.resolve(balance.availableBalance);
  },
  getMinimumSpendAmount() {
    return 0;
  },
  getMaximumSpendAmount() {
    return Number.POSITIVE_INFINITY;
  },
  getFeeCapabilities() {
    return {
      mode: 'tiered',
      customFeeEnabled: true,
    };
  },
};

const strategyByProtocol: Record<SupportedProtocol, ProtocolStrategy> = {
  nativeBtc: nativeBtcStrategy,
  nativeStx: nativeStxStrategy,
  sip10: sip10Strategy,
};

export function getProtocolStrategy(protocol: SupportedProtocol): ProtocolStrategy {
  return strategyByProtocol[protocol];
}

async function resolveFeeRate(
  customFee: number | null,
  feeTier: TransactionFeeTier,
  accountRequest: SwapDependencies['accountRequest'],
  bitcoinTransactionFeesService: SwapDependencies['services']['bitcoinTransactionFeesService'],
  signal: AbortSignal
): Promise<number> {
  if (customFee !== null) {
    return customFee;
  }

  // TODO: This does redundant coin selection just to get fee rates.
  // Consider adding a dedicated fetchFeeRates() method to the service.
  const transactionFees = await bitcoinTransactionFeesService.getBitcoinTransactionFees(
    accountRequest,
    [{ address: DUMMY_P2TR_RECIPIENT, amount: createMoney(0, 'BTC') }],
    true,
    signal
  );

  const feeQuote = transactionFees.options[feeTier] as BitcoinTransactionFeeQuote;
  return feeQuote.rate;
}
