import { PayloadType, StacksTransactionWire, serializePayload } from '@stacks/transactions';
import { BigNumber } from 'bignumber.js';

import { DEFAULT_FEE_RATE } from '@leather.io/constants';
import { FeeCalculationTypes, Fees, Money, StacksFeeEstimate } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

import { FeeEstimation, StacksTxFeeEstimation } from '../hiro-api-types';

function initStxAmount(amount: number) {
  return createMoney(amount, 'STX');
}

const defaultFeesMaxAmounts = [500000, 750000, 2000000];
export const defaultFeesMaxValuesAsMoney = defaultFeesMaxAmounts.map(initStxAmount);

const defaultFeesMinAmounts = [2500, 3000, 3500];
export const defaultFeesMinValuesAsMoney = defaultFeesMinAmounts.map(initStxAmount);

export const defaultApiFeeEstimations: FeeEstimation[] = defaultFeesMinAmounts.map(amount => ({
  fee: amount,
  fee_rate: 0,
}));

const defaultStacksFeeEstimates: StacksFeeEstimate[] = defaultFeesMinValuesAsMoney.map(fee => ({
  fee,
  feeRate: 0,
}));

export function getTokenTransferSpecificFeeEstimations(amounts: number[]) {
  return amounts.map(initStxAmount).map(fee => ({ fee, feeRate: 0 }));
}

export const defaultStacksFees: Fees = {
  blockchain: 'stacks',
  estimates: defaultStacksFeeEstimates,
  calculation: FeeCalculationTypes.Default,
};

export function feeEstimationQueryFailedSilently(feeEstimation: StacksTxFeeEstimation) {
  return !!(feeEstimation && (!!feeEstimation.error || !feeEstimation.estimations.length));
}

export function getEstimatedUnsignedStacksTxByteLength(transaction: StacksTransactionWire) {
  return transaction.serializeBytes().byteLength;
}

export function getSerializedUnsignedStacksTxPayload(transaction: StacksTransactionWire) {
  return serializePayload(transaction.payload);
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
  payloadType: PayloadType | undefined;
  maxValues?: Money[];
  minValues?: Money[];
  txByteLength: number | null;
  tokenTransferFeeEstimations: number[];
}
export function parseStacksTxFeeEstimationResponse({
  feeEstimation,
  payloadType,
  maxValues,
  minValues,
  txByteLength,
  tokenTransferFeeEstimations,
}: ParseStacksTxFeeEstimationResponseArgs): Fees {
  if (feeEstimation.error) return defaultStacksFees;

  if (payloadType === PayloadType.TokenTransfer) {
    return {
      blockchain: 'stacks',
      estimates: getTokenTransferSpecificFeeEstimations(tokenTransferFeeEstimations),
      calculation: FeeCalculationTypes.TokenTransferSpecific,
    };
  }

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
