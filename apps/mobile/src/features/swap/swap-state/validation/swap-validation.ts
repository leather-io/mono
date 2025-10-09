import { SwapInternalState } from '@/features/swap/swap-state/swap-state.types';
import {
  resolveMaximumSpendAmount,
  resolveMinimumSpendAmount,
  resolveSpendableBalanceInCurrencyMode,
} from '@/features/swap/swap-state/swap-state.utils';
import {
  hasValidPrecision,
  isAmountWithinBalance,
  isParsableNumber,
  isPresent,
  isWithinRange,
} from '@/features/swap/swap-state/validation/swap-validation.utils';
import { MAX_SLIPPAGE_PERCENTAGE, MIN_SLIPPAGE_PERCENTAGE } from '@/features/swap/swap.constants';
import { filter, first, isNonNull, map, pipe } from 'remeda';

import { Money } from '@leather.io/models';

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

export type Issue = {
  [K in Field]: {
    field: K;
    code: CodesByField[K];
  };
}[Field];

type ByField = { [K in Field]: Extract<Issue, { field: K }> | undefined };

function rules(...pairs: [boolean, Issue][]): Issue | undefined {
  return pipe(
    pairs,
    filter(([condition]) => !condition),
    map(([, i]) => i),
    first()
  );
}

interface ValidationContext {
  state: SwapInternalState;
  derivedAmounts: { crypto: Money | null; quote: Money | null };
}

export interface ValidationResult {
  isValid: boolean;
  issues: ByField;
}

function validateAmount(context: ValidationContext): Issue | undefined {
  const { state, derivedAmounts } = context;
  const { baseSwapAsset, baseAmount, inputCurrencyMode } = state;
  const decimals = baseSwapAsset?.asset.decimals;
  const canonicalCryptoAmount = derivedAmounts.crypto;
  const activeAmount = derivedAmounts[inputCurrencyMode];
  const spendableBalance = resolveSpendableBalanceInCurrencyMode(
    baseSwapAsset?.balance,
    baseSwapAsset?.asset.protocol,
    inputCurrencyMode
  );
  const needsBalanceValidation =
    isNonNull(activeAmount) &&
    isNonNull(canonicalCryptoAmount) &&
    isNonNull(spendableBalance) &&
    isNonNull(baseSwapAsset);
  const minAmount = resolveMinimumSpendAmount(baseSwapAsset?.asset.protocol);
  const maxAmount = resolveMaximumSpendAmount(baseSwapAsset?.asset.protocol);

  const pairs: [boolean, Issue][] = [
    [isPresent(baseAmount), { field: 'baseAmount', code: 'REQUIRED' }],
    [isParsableNumber(baseAmount), { field: 'baseAmount', code: 'INVALID' }],
    [hasValidPrecision(baseAmount, decimals), { field: 'baseAmount', code: 'PRECISION_INVALID' }],
  ];

  if (needsBalanceValidation) {
    pairs.push(
      [canonicalCryptoAmount.amount.gte(minAmount), { field: 'baseAmount', code: 'TOO_SMALL' }],
      [canonicalCryptoAmount.amount.lte(maxAmount), { field: 'baseAmount', code: 'TOO_LARGE' }],
      [
        isAmountWithinBalance(activeAmount, spendableBalance),
        { field: 'baseAmount', code: 'INSUFFICIENT_BALANCE' },
      ]
    );
  }

  return rules(...pairs);
}

function validateSlippage(context: ValidationContext): Issue | undefined {
  const { state } = context;
  const { slippage } = state;

  return rules(
    [isPresent(slippage), { field: 'slippage', code: 'REQUIRED' }],
    [
      isWithinRange(slippage, MIN_SLIPPAGE_PERCENTAGE, MAX_SLIPPAGE_PERCENTAGE),
      { field: 'slippage', code: 'OUT_OF_RANGE' },
    ]
  );
}

function validateBaseAssetSelected(context: ValidationContext): Issue | undefined {
  if (!context.state.baseSwapAsset) {
    return { field: 'baseSwapAsset', code: 'REQUIRED' };
  }
  return;
}

function validateTargetAssetSelected(context: ValidationContext): Issue | undefined {
  if (!context.state.targetSwapAsset) {
    return { field: 'targetSwapAsset', code: 'REQUIRED' };
  }
  return;
}

export function runValidation(context: ValidationContext): ValidationResult {
  const allIssues = [
    validateAmount,
    validateSlippage,
    validateBaseAssetSelected,
    validateTargetAssetSelected,
  ].flatMap(validator => validator(context));

  return {
    isValid: allIssues.filter(Boolean).length === 0,
    issues: {
      baseSwapAsset: allIssues.find(i => i?.field === 'baseSwapAsset'),
      targetSwapAsset: allIssues.find(i => i?.field === 'targetSwapAsset'),
      baseAmount: allIssues.find(i => i?.field === 'baseAmount'),
      slippage: allIssues.find(i => i?.field === 'slippage'),
      nonce: allIssues.find(i => i?.field === 'nonce'),
    },
  };
}
