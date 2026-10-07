import { useMemo } from 'react';

import type { StacksTransactionWire } from '@stacks/transactions';
import { useQuery } from '@tanstack/react-query';

import {
  createPostStacksFeeTransactionQueryOptions,
  defaultContractCallFeeEstimations,
  defaultContractDeploymentFeeEstimations,
  defaultFeesMaxValuesAsMoney,
  defaultFeesMinValuesAsMoney,
  defaultTokenTransferFeeEstimations,
  parseStacksTxFeeEstimationResponse,
} from '@leather.io/query';
import {
  getEstimatedUnsignedStacksTxByteLength,
  getSerializedUnsignedStacksTxPayload,
} from '@leather.io/stacks';

import { useStacksClient } from '../stacks-client';

export function useCalculateStacksTxFees(unsignedTx?: StacksTransactionWire) {
  const client = useStacksClient();

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
        maxValues: defaultFeesMaxValuesAsMoney,
        minValues: defaultFeesMinValuesAsMoney,
        txByteLength,
        tokenTransferFeeEstimations: defaultTokenTransferFeeEstimations,
        contractCallDefaultFeeEstimations: defaultContractCallFeeEstimations,
        contractDeploymentDefaultFeeEstimations: defaultContractDeploymentFeeEstimations,
      }),
  });
}
