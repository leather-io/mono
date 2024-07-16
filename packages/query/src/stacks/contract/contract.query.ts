import { type ContractCallPayload, TransactionTypes } from '@stacks/connect';
import { useQuery } from '@tanstack/react-query';

import { StacksQueryPrefixes } from '../../query-prefixes';
import { StacksClient, useStacksClient } from '../stacks-client';

const queryOptions = {
  staleTime: 30 * 60 * 1000,
  refetchOnWindowFocus: false,
} as const;

interface CreateGetContractInterfaceQueryOptionsArgs {
  client: StacksClient;
  transactionRequest: ContractCallPayload | null;
}
export function createGetContractInterfaceQueryOptions({
  client,
  transactionRequest,
}: CreateGetContractInterfaceQueryOptionsArgs) {
  return {
    enabled: !!transactionRequest && transactionRequest.txType === TransactionTypes.ContractCall,
    queryKey: [
      StacksQueryPrefixes.GetContractInterface,
      transactionRequest?.contractName,
      transactionRequest?.contractAddress,
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

export function useGetContractInterfaceQuery(transactionRequest: ContractCallPayload | null) {
  const client = useStacksClient();
  return useQuery(createGetContractInterfaceQueryOptions({ client, transactionRequest }));
}
