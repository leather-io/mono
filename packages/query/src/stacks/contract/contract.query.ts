import { ContractCallPayload, TransactionTypes } from '@stacks/connect';
import { useQuery } from '@tanstack/react-query';

import { ContractInterfaceResponseWithFunctions } from '../../../types/contract-types';
import { useHiroApiRateLimiter } from '../hiro-rate-limiter';
import { useStacksClient } from '../stacks-client';

export function useGetContractInterface(transactionRequest: ContractCallPayload | null) {
  const { smartContractsApi } = useStacksClient();
  const limiter = useHiroApiRateLimiter();

  async function fetchContractInterface() {
    if (!transactionRequest || transactionRequest?.txType !== TransactionTypes.ContractCall) return;
    const contractAddress = transactionRequest.contractAddress;
    const contractName = transactionRequest.contractName;
    return limiter.add(
      () =>
        smartContractsApi.getContractInterface({
          contractAddress,
          contractName,
        }) as unknown as Promise<ContractInterfaceResponseWithFunctions>,
      {
        throwOnTimeout: true,
      }
    );
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
