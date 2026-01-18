import {
  type TransactionFeeQuote,
  type TransactionFeeTier,
  type TransactionFees,
} from '@leather.io/models';
import { assertUnreachable, createMoney } from '@leather.io/utils';

import { type FeeOption, type FeeSelection, type NetworkFee } from '../../swap-state.types';
import { type SupportedProtocol, getProtocolStrategy } from '../protocol/protocol';

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
      calculation: transactionFees.options.standard,
    };
  }

  const options = buildOptions(transactionFees);
  const selected = buildSelection(feeCapabilities, tier, customFee);

  return {
    mode: 'tiered',
    customFeeEnabled: feeCapabilities.customFeeEnabled,
    options,
    calculation: calculateSelectedFee(transactionFees, selected),
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

function calculateSelectedFee(transactionFees: TransactionFees, selection: FeeSelection) {
  switch (selection.type) {
    case 'tiered':
      return transactionFees.options[selection.tier];
    case 'custom':
      return calculateCustomFee(transactionFees.options.standard, selection.value);
    default:
      assertUnreachable(selection);
  }
}

function calculateCustomFee(
  reference: TransactionFeeQuote,
  customValue: number
): TransactionFeeQuote {
  if (reference.type === 'bitcoinFeeRate' || reference.type === 'stacksFeeRate') {
    const feeAmount = Math.ceil(customValue * reference.estimatedTxSize);
    return {
      ...reference,
      rate: customValue,
      value: createMoney(feeAmount, reference.value.symbol, reference.value.decimals),
    };
  }

  return reference;
}
