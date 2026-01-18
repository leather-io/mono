import { type Money } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

import { type DerivedAmounts, type SwapInternalState } from '../swap-state.types';
import { MAX_SLIPPAGE_PERCENTAGE, MIN_SLIPPAGE_PERCENTAGE } from '../swap.constants';
import { resolveMaximumSpendAmount, resolveMinimumSpendAmount } from '../utils/protocol-operations';
import {
  type BaseAmountIssue,
  type BaseSwapAssetIssue,
  type SlippageIssue,
  type TargetSwapAssetIssue,
  type ValidationResult,
} from './swap-validation.types';
import {
  hasValidPrecision,
  isParsableNumber,
  isPresent,
  isWithinRange,
} from './swap-validation.utils';

export interface ValidationContext {
  state: SwapInternalState;
  derivedAmounts: DerivedAmounts;
  spendableAmount: Money | null;
}

function validateAmount(context: ValidationContext): BaseAmountIssue | undefined {
  const { state, derivedAmounts, spendableAmount } = context;
  const { baseSwapAsset, baseAmount, inputCurrencyMode } = state;
  const unselectedAssetMaxDecimals = 32;
  const maxAllowedDecimals = baseSwapAsset
    ? baseSwapAsset.asset.decimals
    : unselectedAssetMaxDecimals;
  const canonicalCryptoAmount = derivedAmounts.crypto;
  const activeAmount = derivedAmounts[inputCurrencyMode];
  const minAmount = resolveMinimumSpendAmount(baseSwapAsset?.asset.protocol);
  const maxAmount = resolveMaximumSpendAmount(baseSwapAsset?.asset.protocol);

  if (!isPresent(baseAmount)) {
    return { field: 'baseAmount', code: 'REQUIRED' };
  }

  if (!isParsableNumber(baseAmount)) {
    return { field: 'baseAmount', code: 'INVALID' };
  }

  if (!hasValidPrecision(baseAmount, maxAllowedDecimals)) {
    return {
      field: 'baseAmount',
      code: 'PRECISION_INVALID',
      context: { decimals: maxAllowedDecimals },
    };
  }

  if (!activeAmount || !canonicalCryptoAmount || !spendableAmount || !baseSwapAsset) {
    return undefined;
  }

  if (canonicalCryptoAmount.amount.isLessThan(minAmount)) {
    return {
      field: 'baseAmount',
      code: 'TOO_SMALL',
      context: {
        minimum: createMoney(
          minAmount,
          canonicalCryptoAmount.symbol,
          canonicalCryptoAmount.decimals
        ),
      },
    };
  }

  if (canonicalCryptoAmount.amount.isGreaterThan(maxAmount)) {
    return {
      field: 'baseAmount',
      code: 'TOO_LARGE',
      context: {
        maximum: createMoney(
          maxAmount,
          canonicalCryptoAmount.symbol,
          canonicalCryptoAmount.decimals
        ),
      },
    };
  }

  if (canonicalCryptoAmount.amount.isGreaterThan(spendableAmount.amount)) {
    return {
      field: 'baseAmount',
      code: 'INSUFFICIENT_BALANCE',
      context: { balance: spendableAmount },
    };
  }

  return undefined;
}

function validateSlippage(context: ValidationContext): SlippageIssue | undefined {
  const { state } = context;
  const { slippage } = state;

  if (!isPresent(slippage)) {
    return { field: 'slippage', code: 'REQUIRED' };
  }

  if (!isWithinRange(slippage, MIN_SLIPPAGE_PERCENTAGE, MAX_SLIPPAGE_PERCENTAGE)) {
    return {
      field: 'slippage',
      code: 'OUT_OF_RANGE',
      context: { min: MIN_SLIPPAGE_PERCENTAGE, max: MAX_SLIPPAGE_PERCENTAGE },
    };
  }

  return undefined;
}

function validateBaseAssetSelected(context: ValidationContext): BaseSwapAssetIssue | undefined {
  const { state } = context;

  if (!state.baseSwapAsset) {
    return { field: 'baseSwapAsset', code: 'REQUIRED' };
  }

  return undefined;
}

function validateTargetAssetSelected(context: ValidationContext): TargetSwapAssetIssue | undefined {
  const { state } = context;

  if (!state.targetSwapAsset) {
    return { field: 'targetSwapAsset', code: 'REQUIRED' };
  }

  return undefined;
}

export function runValidation(context: ValidationContext): ValidationResult {
  const baseSwapAsset = validateBaseAssetSelected(context);
  const targetSwapAsset = validateTargetAssetSelected(context);
  const baseAmount = validateAmount(context);
  const slippage = validateSlippage(context);

  return {
    isValid: !baseSwapAsset && !targetSwapAsset && !baseAmount && !slippage,
    issues: {
      baseSwapAsset,
      targetSwapAsset,
      baseAmount,
      slippage,
      nonce: undefined,
    },
  };
}
