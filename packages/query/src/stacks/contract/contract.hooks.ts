import type { TransactionPayload } from '@stacks/connect';
import { useQuery } from '@tanstack/react-query';

import { ContractInterfaceFunction } from '../hiro-api-types';
import { useStacksClient } from '../stacks-client';
import { createGetContractInterfaceQueryOptions } from './contract.query';

export function useContractFunction(transactionRequest: TransactionPayload | null) {
  const client = useStacksClient();
  return useQuery({
    ...createGetContractInterfaceQueryOptions({ client, transactionRequest }),
    select: resp =>
      resp?.functions.find((func: ContractInterfaceFunction) => {
        if (!transactionRequest || transactionRequest.txType !== 'contract_call') return;
        return func.name === transactionRequest?.functionName;
      }),
  });
}
