import { type ContractCallPayload, TransactionTypes } from '@stacks/connect';
import { useQuery } from '@tanstack/react-query';

import { useStacksClient } from '../stacks-client';

export function useGetContractInterfaceQuery(transactionRequest: ContractCallPayload | null) {
  const client = useStacksClient();

  async function fetchContractInterface() {
    if (!transactionRequest || transactionRequest?.txType !== TransactionTypes.ContractCall) return;
    const contractAddress = transactionRequest.contractAddress;
    const contractName = transactionRequest.contractName;
    return client.getContractInterface(contractAddress, contractName);
  }

  return useQuery({
    enabled: transactionRequest?.txType === TransactionTypes.ContractCall && !!transactionRequest,
    queryKey: [
      'contract-interface',
      transactionRequest?.contractName,
      transactionRequest?.contractAddress,
    ],
    queryFn: fetchContractInterface,
    staleTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
