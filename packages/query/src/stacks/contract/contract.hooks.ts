import type { ContractCallPayload, TransactionPayload } from '@stacks/connect';
import type { ContractInterfaceFunction } from '@stacks/rpc-client';

import { useGetContractInterfaceQuery } from './contract.query';

export function useContractInterface(transactionRequest: ContractCallPayload | null) {
  return useGetContractInterfaceQuery(transactionRequest).data;
}

export function useContractFunction(transactionRequest: TransactionPayload | null) {
  const contractInterface = useContractInterface(transactionRequest as ContractCallPayload);

  if (!transactionRequest || transactionRequest.txType !== 'contract_call' || !contractInterface)
    return;

  const selectedFunction = contractInterface.functions.find((func: ContractInterfaceFunction) => {
    return func.name === transactionRequest.functionName;
  });

  return selectedFunction;
}
