import type { ContractCallPayload, TransactionPayload } from '@stacks/connect';
import { useQuery } from '@tanstack/react-query';

import { StacksQueryPrefixes } from '../../query-prefixes';
import { StacksClient, useStacksClient } from '../stacks-client';

enum TransactionTypes {
  ContractCall = 'contract_call',
  ContractDeploy = 'smart_contract',
  STXTransfer = 'token_transfer',
}

const queryOptions = {
  staleTime: 30 * 60 * 1000,
  refetchOnWindowFocus: false,
} as const;

interface CreateGetContractInterfaceQueryOptionsArgs {
  client: StacksClient;
  transactionRequest: TransactionPayload | null;
}
export function createGetContractInterfaceQueryOptions({
  client,
  transactionRequest,
}: CreateGetContractInterfaceQueryOptionsArgs) {
  return {
    enabled: !!transactionRequest && transactionRequest.txType === TransactionTypes.ContractCall,
    queryKey: [
      StacksQueryPrefixes.GetContractInterface,
      (transactionRequest as ContractCallPayload)?.contractName,
      (transactionRequest as ContractCallPayload)?.contractAddress,
    ],
    queryFn: () => {
      if (!transactionRequest || transactionRequest?.txType !== TransactionTypes.ContractCall)
        return;
      const contractAddress = transactionRequest.contractAddress;
      const contractName = transactionRequest.contractName;
      return client.getContractInterface(contractAddress, contractName);
    },
    ...queryOptions,
  } as const;
}

export function useGetContractInterfaceQuery(transactionRequest: TransactionPayload | null) {
  const client = useStacksClient();
  return useQuery(createGetContractInterfaceQueryOptions({ client, transactionRequest }));
}
