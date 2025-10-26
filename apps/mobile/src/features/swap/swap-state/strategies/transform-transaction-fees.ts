import {
  CustomFeeConfig,
  FeeOption,
  FeeSelection,
  NetworkFee,
  SwapInternalState,
} from '@/features/swap/swap-state/swap-state.types';
import { map } from 'remeda';

import {
  Money,
  TransactionFeeTier,
  TransactionFees,
  transactionFeeTiers,
} from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

import { FeeCapabilities } from './protocol/protocol';

export function transformTransactionFees(
  transactionFees: TransactionFees,
  feeCapabilities: FeeCapabilities,
  state: SwapInternalState
): NetworkFee {
  if (feeCapabilities.mode === 'fixed') {
    return createFixedNetworkFee(transactionFees);
  }

  return createTieredNetworkFee(transactionFees, feeCapabilities.customConfig, state);
}

function createFixedNetworkFee(transactionFees: TransactionFees): NetworkFee {
  return {
    mode: 'fixed',
    value: transactionFees.options.standard.value,
  };
}

function createTieredNetworkFee(
  transactionFees: TransactionFees,
  customConfig: CustomFeeConfig,
  state: SwapInternalState
): NetworkFee {
  const options = buildFeeOptions(transactionFees);
  const selection = buildFeeSelection(state.feeTier, state.customFee);
  const value = calculateSelectedFeeValue(options, selection, state.customFee);

  return {
    mode: 'tiered',
    value,
    options,
    selected: selection,
    customFeeConfig: customConfig,
  };
}

function buildFeeOptions(transactionFees: TransactionFees): FeeOption[] {
  return map(transactionFeeTiers, tier => ({
    tier,
    calculation: transactionFees.options[tier],
    value: transactionFees.options[tier].value,
  }));
}

function buildFeeSelection(feeTier: string, customFee: number | null): FeeSelection {
  if (feeTier === 'custom' && customFee !== null) {
    return {
      type: 'custom',
      value: customFee,
    };
  }

  const validTier = isTransactionFeeTier(feeTier) ? feeTier : 'standard';
  return {
    type: 'tiered',
    tier: validTier,
  };
}

function calculateSelectedFeeValue(
  options: FeeOption[],
  selection: FeeSelection,
  customFee: number | null
): Money {
  if (selection.type === 'custom' && customFee !== null) {
    return createCustomFeeMoney(options, customFee);
  }

  return findTieredFeeValue(options, selection);
}

function createCustomFeeMoney(options: FeeOption[], customFee: number): Money {
  const referenceFee = findStandardFee(options);
  return createMoney(customFee, referenceFee.symbol);
}

function findTieredFeeValue(options: FeeOption[], selection: FeeSelection): Money {
  if (selection.type === 'custom') {
    return findStandardFee(options);
  }

  const option = options.find(opt => opt.tier === selection.tier);
  return option ? option.value : findStandardFee(options);
}

function findStandardFee(options: FeeOption[]): Money {
  const standardOption = options.find(opt => opt.tier === 'standard');
  if (standardOption) return standardOption.value;

  const fallback = options[0];
  return fallback ? fallback.value : createMoney(0, 'STX');
}

function isTransactionFeeTier(tier: string): tier is TransactionFeeTier {
  return tier === 'low' || tier === 'standard' || tier === 'high';
}
