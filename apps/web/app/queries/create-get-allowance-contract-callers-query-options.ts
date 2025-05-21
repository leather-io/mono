import { ClarityValue, hexToCV, principalCV, serializeCV } from '@stacks/transactions';

import { StackingQueryPrefixes, StacksClient } from '@leather.io/query';

interface CreateGetAllowanceContractCallersQueryOptionsArgs {
  senderAddress?: string;
  contractAddress: string;
  contractName: string;
  callingContract: string;
}

interface ClientParam {
  client: StacksClient;
}

export type AllowanceContractCallersResult = string[]; // массив principal'ов

export function createGetAllowanceContractCallersQueryOptions(
  params: CreateGetAllowanceContractCallersQueryOptionsArgs & ClientParam
) {
  const { senderAddress, contractAddress, contractName, callingContract, client } = params;

  return {
    queryKey: [
      StackingQueryPrefixes.GetAllowanceContractCallers,
      senderAddress,
      callingContract,
      contractAddress,
      contractName,
    ],
    enabled: !!senderAddress && !!contractAddress && !!contractName && !!callingContract,
    queryFn: async (): Promise<ClarityValue | null> => {
      if (!senderAddress) return null;

      const arg1 = `0x${serializeCV(principalCV(senderAddress))}`;
      const arg2 = `0x${serializeCV(principalCV(callingContract))}`;

      const res = await client.callReadOnlyFunction({
        contractAddress,
        contractName,
        functionName: 'get-allowance-contract-callers',
        readOnlyFunctionArgs: {
          arguments: [arg1, arg2],
          sender: senderAddress,
        },
      });

      if (!res.okay || !res.result) {
        return null;
      }

      return hexToCV(res.result);
    },
  };
}
