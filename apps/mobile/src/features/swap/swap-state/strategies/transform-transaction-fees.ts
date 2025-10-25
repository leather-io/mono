import { FeeOption, FeeSelection, NetworkFee } from '@/features/swap/swap-state/swap-state.types';

import {
  Money,
  TransactionFeeQuote,
  TransactionFeeTier,
  TransactionFees,
} from '@leather.io/models';
import { assertUnreachable, createMoney } from '@leather.io/utils';

import { SupportedProtocol, getProtocolStrategy } from './protocol/protocol';

export function transformTransactionFees(
  transactionFees: TransactionFees,
  protocol: SupportedProtocol,
  tier: TransactionFeeTier,
  customFee: number | null
): NetworkFee {
  const { getFeeCapabilities } = getProtocolStrategy(protocol);
  const feeCapabilities = getFeeCapabilities();

  if (feeCapabilities.mode === 'fixed') {
    return {
      mode: 'fixed',
      value: transactionFees.options.standard.value,
    };
  }

  const options = buildOptions(transactionFees);
  const selected = buildSelection(feeCapabilities, tier, customFee);
  const value = calculateSelectedFeeValue(transactionFees, selected);

  return {
    mode: 'tiered',
    customFeeEnabled: feeCapabilities.customFeeEnabled,
    options,
    value,
    selected,
  };
}

function buildOptions(transactionFees: TransactionFees): FeeOption[] {
  return [
    {
      tier: 'low',
      calculation: transactionFees.options.low,
      value: transactionFees.options.low.value,
    },
    {
      tier: 'standard',
      calculation: transactionFees.options.standard,
      value: transactionFees.options.standard.value,
    },
    {
      tier: 'high',
      calculation: transactionFees.options.high,
      value: transactionFees.options.high.value,
    },
  ];
}

function buildSelection(
  feeCapabilities: { customFeeEnabled: boolean },
  tier: TransactionFeeTier,
  customFee: number | null
): FeeSelection {
  if (feeCapabilities.customFeeEnabled && customFee !== null) {
    return { type: 'custom', value: customFee };
  }
  return { type: 'tiered', tier };
}

function calculateSelectedFeeValue(
  transactionFees: TransactionFees,
  selection: FeeSelection
): Money {
  switch (selection.type) {
    case 'tiered':
      return transactionFees.options[selection.tier].value;
    case 'custom':
      return calculateCustomFee(transactionFees.options.standard, selection.value);
    default:
      assertUnreachable(selection);
  }
}

function calculateCustomFee(reference: TransactionFeeQuote, customValue: number) {
  if (reference.type === 'feeRate') {
    const feeAmount = Math.ceil(customValue * reference.estimatedTxSize);
    return createMoney(feeAmount, reference.value.symbol, reference.value.decimals);
  }

  return createMoney(customValue, reference.value.symbol, reference.value.decimals);
}
