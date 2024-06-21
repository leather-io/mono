import { useMemo } from 'react';

import { StacksTransaction } from '@stacks/transactions';

import { FeeCalculationTypes, Fees, Money, StacksFeeEstimate } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

import {
  useConfigFeeEstimationsMaxEnabled,
  useConfigFeeEstimationsMaxValues,
  useConfigFeeEstimationsMinEnabled,
  useConfigFeeEstimationsMinValues,
} from '../../common/remote-config/remote-config.query';
import { StacksTxFeeEstimation } from '../hiro-api-types';
import { useGetStacksTransactionFeeEstimationQuery } from './fees.query';
import {
  defaultFeesMaxValuesAsMoney,
  defaultFeesMinValuesAsMoney,
  defaultStacksFees,
  feeEstimationQueryFailedSilently,
  getDefaultSimulatedFeeEstimations,
  getEstimatedUnsignedStacksTxByteLength,
  getFeeEstimationsWithCappedValues,
  getSerializedUnsignedStacksTxPayload,
} from './fees.utils';

function useFeeEstimationsMaxValues() {
  const configFeeEstimationsMaxEnabled = useConfigFeeEstimationsMaxEnabled();
  const configFeeEstimationsMaxValues = useConfigFeeEstimationsMaxValues();

  if (configFeeEstimationsMaxEnabled === false) return;
  return configFeeEstimationsMaxValues || defaultFeesMaxValuesAsMoney;
}

function useFeeEstimationsMinValues() {
  const configFeeEstimationsMinEnabled = useConfigFeeEstimationsMinEnabled();
  const configFeeEstimationsMinValues = useConfigFeeEstimationsMinValues();

  if (configFeeEstimationsMinEnabled === false) return;
  return configFeeEstimationsMinValues || defaultFeesMinValuesAsMoney;
}

interface ParseStacksTxFeeEstimationResponseArgs {
  feeEstimation: StacksTxFeeEstimation;
  maxValues?: Money[];
  minValues?: Money[];
  txByteLength: number | null;
}
function parseStacksTxFeeEstimationResponse({
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

export function useCalculateStacksTxFees(unsignedTx?: StacksTransaction) {
  const feeEstimationsMaxValues = useFeeEstimationsMaxValues();
  const feeEstimationsMinValues = useFeeEstimationsMinValues();

  const { txByteLength, txPayload } = useMemo(() => {
    if (!unsignedTx) return { txByteLength: null, txPayload: '' };

    return {
      txByteLength: getEstimatedUnsignedStacksTxByteLength(unsignedTx),
      txPayload: getSerializedUnsignedStacksTxPayload(unsignedTx),
    };
  }, [unsignedTx]);

  return useGetStacksTransactionFeeEstimationQuery(txByteLength, txPayload, {
    select: resp =>
      parseStacksTxFeeEstimationResponse({
        feeEstimation: resp,
        maxValues: feeEstimationsMaxValues,
        minValues: feeEstimationsMinValues,
        txByteLength,
      }),
  });
}
