import { bytesToHex } from '@stacks/common';
import { StacksTransaction, serializePayload } from '@stacks/transactions';
import { BigNumber } from 'bignumber.js';

import { DEFAULT_FEE_RATE } from '@leather.io/constants';
import { FeeCalculationTypes, Fees, Money, StacksFeeEstimate } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

import { FeeEstimation, StacksTxFeeEstimation } from '../hiro-api-types';

const defaultFeesMaxValues = [500000, 750000, 2000000];
const defaultFeesMinValues = [2500, 3000, 3500];

export const defaultFeesMaxValuesAsMoney = [
  createMoney(defaultFeesMaxValues[0], 'STX'),
  createMoney(defaultFeesMaxValues[1], 'STX'),
  createMoney(defaultFeesMaxValues[2], 'STX'),
];
export const defaultFeesMinValuesAsMoney = [
  createMoney(defaultFeesMinValues[0], 'STX'),
  createMoney(defaultFeesMinValues[1], 'STX'),
  createMoney(defaultFeesMinValues[2], 'STX'),
];

export const defaultApiFeeEstimations: FeeEstimation[] = [
  { fee: defaultFeesMinValues[0], fee_rate: 0 },
  { fee: defaultFeesMinValues[1], fee_rate: 0 },
  { fee: defaultFeesMinValues[2], fee_rate: 0 },
];

const defaultStacksFeeEstimates: StacksFeeEstimate[] = [
  { fee: defaultFeesMinValuesAsMoney[0], feeRate: 0 },
  { fee: defaultFeesMinValuesAsMoney[1], feeRate: 0 },
  { fee: defaultFeesMinValuesAsMoney[2], feeRate: 0 },
];

export const defaultStacksFees: Fees = {
  blockchain: 'stacks',
  estimates: defaultStacksFeeEstimates,
  calculation: FeeCalculationTypes.Default,
};

export function feeEstimationQueryFailedSilently(feeEstimation: StacksTxFeeEstimation) {
  return !!(feeEstimation && (!!feeEstimation.error || !feeEstimation.estimations.length));
}

export function getEstimatedUnsignedStacksTxByteLength(transaction: StacksTransaction) {
  return transaction.serialize().byteLength;
}

export function getSerializedUnsignedStacksTxPayload(transaction: StacksTransaction) {
  return bytesToHex(serializePayload(transaction.payload));
}

export function getFeeEstimationsWithCappedValues(
  feeEstimations: StacksFeeEstimate[],
  feeEstimationsMaxValues: Money[] | undefined,
  feeEstimationsMinValues: Money[] | undefined
) {
  return feeEstimations.map((feeEstimation, index) => {
    if (
      feeEstimationsMaxValues &&
      feeEstimation.fee.amount.isGreaterThan(feeEstimationsMaxValues[index].amount)
    ) {
      return { fee: feeEstimationsMaxValues[index], feeRate: 0 };
    } else if (
      feeEstimationsMinValues &&
      feeEstimation.fee.amount.isLessThan(feeEstimationsMinValues[index].amount)
    ) {
      return { fee: feeEstimationsMinValues[index], feeRate: 0 };
    }
    return feeEstimation;
  });
}

function calculateFeeFromFeeRate(txBytes: number, feeRate: number) {
  return new BigNumber(txBytes).multipliedBy(feeRate);
}

const marginFromDefaultFeeDecimalPercent = 0.1;

export function getDefaultSimulatedFeeEstimations(
  estimatedByteLength: number
): StacksFeeEstimate[] {
  const fee = calculateFeeFromFeeRate(estimatedByteLength, DEFAULT_FEE_RATE);
  return [
    {
      fee: createMoney(fee.multipliedBy(1 - marginFromDefaultFeeDecimalPercent), 'STX'),
      feeRate: 0,
    },
    { fee: createMoney(fee, 'STX'), feeRate: 0 },
    {
      fee: createMoney(fee.multipliedBy(1 + marginFromDefaultFeeDecimalPercent), 'STX'),
      feeRate: 0,
    },
  ];
}

interface ParseStacksTxFeeEstimationResponseArgs {
  feeEstimation: StacksTxFeeEstimation;
  maxValues?: Money[];
  minValues?: Money[];
  txByteLength: number | null;
}
export function parseStacksTxFeeEstimationResponse({
  feeEstimation,
  maxValues,
  minValues,
  txByteLength,
}: ParseStacksTxFeeEstimationResponseArgs): Fees {
  if (feeEstimation.error) return defaultStacksFees;
  if (txByteLength && feeEstimationQueryFailedSilently(feeEstimation)) {
    return {
      blockchain: 'stacks',
      estimates: getDefaultSimulatedFeeEstimations(txByteLength),
      calculation: FeeCalculationTypes.DefaultSimulated,
    };
  }

  const stacksFeeEstimates: StacksFeeEstimate[] = feeEstimation.estimations.map(estimate => {
    return {
      fee: createMoney(estimate.fee, 'STX'),
      feeRate: estimate.fee_rate,
    };
  });

  if (feeEstimation.estimations?.length) {
    const feeEstimationsWithCappedValues = getFeeEstimationsWithCappedValues(
      stacksFeeEstimates,
      maxValues,
      minValues
    );
    return {
      blockchain: 'stacks',
      estimates: feeEstimationsWithCappedValues,
      calculation: FeeCalculationTypes.FeesCapped,
    };
  }
  return {
    blockchain: 'stacks',
    estimates: stacksFeeEstimates ?? [],
    calculation: FeeCalculationTypes.Api,
  };
}
