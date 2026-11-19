import BigNumber from 'bignumber.js';

import {
  type Money,
  type StacksContractCallSwapExecutionData,
  type StacksProtocol,
} from '@leather.io/models';
import { createMoney, initBigNumber, isDefined } from '@leather.io/utils';

import { type LeatherApiSwapDex } from '../infrastructure/api/leather/leather-api.client';

export function mapToStacksProtocol(dex: LeatherApiSwapDex): StacksProtocol {
  return {
    id: dex.id,
    name: dex.name,
    url: dex.url,
    logo: dex.logo,
    description: dex.description,
  };
}

export function mapBitflowDexProviderToSwapDexId(dex = 'Unknown') {
  const lowercaseDexName = dex.toLowerCase();
  if (lowercaseDexName.includes('alex')) {
    return 'alex';
  }
  if (lowercaseDexName.includes('arkadiko')) {
    return 'arkadiko';
  }
  if (lowercaseDexName.includes('bitflow')) {
    return 'bitflow';
  }
  if (lowercaseDexName.includes('velar')) {
    return 'velar';
  }
  return 'unknown';
}

export function calculateMinReceiveAmount(quoteAmount: Money, slippage: BigNumber): Money {
  const minReceiveAmount = quoteAmount.amount.times(BigNumber(1).minus(slippage));
  return createMoney(
    minReceiveAmount.integerValue(BigNumber.ROUND_DOWN),
    quoteAmount.symbol,
    quoteAmount.decimals
  );
}

const MIN_RECEIVE_AMOUNT_FRACTIONAL_UNIT_TOLERANCE = 10;

export function hasValidMinReceiveAmountPostCondition(
  executionData: StacksContractCallSwapExecutionData,
  slippagePercentage: BigNumber
): boolean {
  const minAmount = calculateMinReceiveAmount(executionData.quote.targetAmount, slippagePercentage);
  const minThreshold = minAmount.amount.minus(MIN_RECEIVE_AMOUNT_FRACTIONAL_UNIT_TOLERANCE);

  const { targetAsset } = executionData.quote;

  function readMatchingGtePostConditionAmount(pc: unknown) {
    if (typeof pc !== 'object' || pc === null || !('type' in pc) || !('condition' in pc)) {
      return undefined;
    }
    const isMatchingGtePostCondition =
      ((targetAsset.protocol === 'nativeStx' && pc.type === 'stx-postcondition') ||
        (targetAsset.protocol === 'sip10' &&
          pc.type === 'ft-postcondition' &&
          'asset' in pc &&
          pc.asset === targetAsset.assetId)) &&
      pc.condition === 'gte';
    if (!isMatchingGtePostCondition || !('amount' in pc)) return undefined;
    const { amount } = pc;
    return typeof amount === 'string' || typeof amount === 'number' || typeof amount === 'bigint'
      ? amount
      : undefined;
  }

  const totalGteAmount = executionData.postConditions
    .map(readMatchingGtePostConditionAmount)
    .filter(isDefined)
    .reduce((sum, amount) => sum.plus(initBigNumber(amount)), new BigNumber(0));

  return totalGteAmount.gte(minThreshold);
}
