import { SwapInternalState } from '@/features/swap/swap-state/swap-state.types';
import {
  resolveMaximumSpendAmount,
  resolveMinimumSpendAmount,
  resolveSpendableBalanceInCurrencyMode,
} from '@/features/swap/swap-state/utils/protocol-operations';
import {
  hasValidPrecision,
  isAmountWithinBalance,
  isParsableNumber,
  isPresent,
  isWithinRange,
} from '@/features/swap/swap-state/validation/swap-validation.utils';
import { MAX_SLIPPAGE_PERCENTAGE, MIN_SLIPPAGE_PERCENTAGE } from '@/features/swap/swap.constants';

import { Money } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

export type Field = 'baseSwapAsset' | 'targetSwapAsset' | 'baseAmount' | 'slippage' | 'nonce';

export interface CodesByField {
  baseSwapAsset: 'REQUIRED';
  targetSwapAsset: 'REQUIRED';
  baseAmount:
    | 'REQUIRED'
    | 'TOO_LARGE'
    | 'TOO_SMALL'
    | 'INVALID'
    | 'PRECISION_INVALID'
    | 'INSUFFICIENT_BALANCE';
  nonce: 'INVALID';
  slippage: 'REQUIRED' | 'INVALID' | 'OUT_OF_RANGE';
}

export type BaseAmountIssue =
  | { field: 'baseAmount'; code: 'REQUIRED' }
  | { field: 'baseAmount'; code: 'INVALID' }
  | { field: 'baseAmount'; code: 'PRECISION_INVALID'; context: { decimals: number } }
  | { field: 'baseAmount'; code: 'TOO_SMALL'; context: { minimum: Money } }
  | { field: 'baseAmount'; code: 'TOO_LARGE'; context: { maximum: Money } }
  | { field: 'baseAmount'; code: 'INSUFFICIENT_BALANCE'; context: { balance: Money } };

type SlippageIssue =
  | { field: 'slippage'; code: 'REQUIRED' }
  | { field: 'slippage'; code: 'INVALID' }
  | { field: 'slippage'; code: 'OUT_OF_RANGE'; context: { min: number; max: number } };

interface BaseSwapAssetIssue {
  field: 'baseSwapAsset';
  code: 'REQUIRED';
}
interface TargetSwapAssetIssue {
  field: 'targetSwapAsset';
  code: 'REQUIRED';
}
interface NonceIssue {
  field: 'nonce';
  code: 'INVALID';
}

export type Issue =
  | BaseAmountIssue
  | SlippageIssue
  | BaseSwapAssetIssue
  | TargetSwapAssetIssue
  | NonceIssue;

type ByField = {
  [F in Field]: Extract<Issue, { field: F }> | undefined;
};

interface ValidationContext {
  state: SwapInternalState;
  derivedAmounts: { crypto: Money | null; quote: Money | null };
}

export interface ValidationResult {
  isValid: boolean;
  issues: ByField;
}

function validateAmount(context: ValidationContext): BaseAmountIssue | undefined {
  const { state, derivedAmounts } = context;
  const { baseSwapAsset, baseAmount, inputCurrencyMode } = state;
  const decimals = baseSwapAsset?.asset.decimals ?? Number.MAX_SAFE_INTEGER;
  const canonicalCryptoAmount = derivedAmounts.crypto;
  const activeAmount = derivedAmounts[inputCurrencyMode];
  const minAmount = resolveMinimumSpendAmount(baseSwapAsset?.asset.protocol);
  const maxAmount = resolveMaximumSpendAmount(baseSwapAsset?.asset.protocol);

  const spendableBalance = resolveSpendableBalanceInCurrencyMode(
    baseSwapAsset?.balance,
    baseSwapAsset?.asset.protocol,
    inputCurrencyMode
  );

  if (!isPresent(baseAmount)) {
    return { field: 'baseAmount', code: 'REQUIRED' };
  }

  if (!isParsableNumber(baseAmount)) {
    return { field: 'baseAmount', code: 'INVALID' };
  }

  if (!hasValidPrecision(baseAmount, decimals)) {
    return { field: 'baseAmount', code: 'PRECISION_INVALID', context: { decimals } };
  }

  if (!activeAmount || !canonicalCryptoAmount || !spendableBalance || !baseSwapAsset) {
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

  if (!isAmountWithinBalance(activeAmount, spendableBalance)) {
    return {
      field: 'baseAmount',
      code: 'INSUFFICIENT_BALANCE',
      context: { balance: spendableBalance },
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
