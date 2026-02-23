import type { PostCondition } from '@stacks/transactions';
import BigNumber from 'bignumber.js';

import {
  type Money,
  type StacksContractCallSwapExecutionData,
  type StacksProtocol,
} from '@leather.io/models';
import { createMoney, initBigNumber } from '@leather.io/utils';

import { LeatherApiSwapDex } from '../infrastructure/api/leather/leather-api.client';

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

  const minTolerance = minAmount.amount.minus(MIN_RECEIVE_AMOUNT_FRACTIONAL_UNIT_TOLERANCE);
  const maxTolerance = minAmount.amount.plus(MIN_RECEIVE_AMOUNT_FRACTIONAL_UNIT_TOLERANCE);

  function isWithinTolerance(amount: string | number | bigint): boolean {
    const amountNumber = initBigNumber(amount);
    return amountNumber.gte(minTolerance) && amountNumber.lte(maxTolerance);
  }

  const { targetAsset } = executionData.quote;

  return (executionData.postConditions as PostCondition[]).some(pc => {
    return (
      ((targetAsset.protocol === 'nativeStx' && pc.type === 'stx-postcondition') ||
        (targetAsset.protocol === 'sip10' &&
          pc.type === 'ft-postcondition' &&
          pc.asset === targetAsset.assetId)) &&
      pc.condition === 'gte' &&
      isWithinTolerance(pc.amount)
    );
  });
}
