import { useMemo } from 'react';

import { StacksTransactionWire } from '@stacks/transactions';
import { useQuery } from '@tanstack/react-query';

import {
  useConfigFeeEstimationsMaxEnabled,
  useConfigFeeEstimationsMaxValues,
  useConfigFeeEstimationsMinEnabled,
  useConfigFeeEstimationsMinValues,
  useConfigStacksContractCallFeeEstimations,
  useConfigStacksContractDeploymentFeeEstimations,
  useConfigTokenTransferFeeEstimations,
} from '../../common/remote-config/remote-config.query';
import { useStacksClient } from '../stacks-client';
import { createPostStacksFeeTransactionQueryOptions } from './fees.query';
import {
  defaultFeesMaxValuesAsMoney,
  defaultFeesMinValuesAsMoney,
  getEstimatedUnsignedStacksTxByteLength,
  getSerializedUnsignedStacksTxPayload,
  parseStacksTxFeeEstimationResponse,
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

export function useCalculateStacksTxFees(unsignedTx?: StacksTransactionWire) {
  const client = useStacksClient();
  const feeEstimationsMaxValues = useFeeEstimationsMaxValues();
  const feeEstimationsMinValues = useFeeEstimationsMinValues();
  const tokenTransferFeeEstimations = useConfigTokenTransferFeeEstimations();
  const contractCallDefaultFeeEstimations = useConfigStacksContractCallFeeEstimations();
  const contractDeploymentDefaultFeeEstimations = useConfigStacksContractDeploymentFeeEstimations();

  const { txByteLength, txPayload } = useMemo(() => {
    if (!unsignedTx) return { txByteLength: null, txPayload: '' };

    return {
      txByteLength: getEstimatedUnsignedStacksTxByteLength(unsignedTx),
      txPayload: getSerializedUnsignedStacksTxPayload(unsignedTx),
    };
  }, [unsignedTx]);

  return useQuery({
    ...createPostStacksFeeTransactionQueryOptions({
      client,
      estimatedLen: txByteLength,
      transactionPayload: txPayload,
    }),
    select: resp =>
      parseStacksTxFeeEstimationResponse({
        feeEstimation: resp,
        payloadType: unsignedTx?.payload.payloadType,
        maxValues: feeEstimationsMaxValues,
        minValues: feeEstimationsMinValues,
        txByteLength,
        tokenTransferFeeEstimations,
        contractCallDefaultFeeEstimations,
        contractDeploymentDefaultFeeEstimations,
      }),
  });
}
