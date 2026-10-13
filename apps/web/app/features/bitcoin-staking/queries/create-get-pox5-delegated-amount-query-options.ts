import { ClarityType, hexToCV, principalCV, serializeCV, uintCV } from '@stacks/transactions';

import { parseContractId } from '../utils/contract-id';

interface Pox5DelegatedAmountReader {
  callReadOnlyFunction(args: {
    contractAddress: string;
    contractName: string;
    functionName: string;
    readOnlyFunctionArgs: { arguments: string[]; sender: string };
    signal?: AbortSignal;
  }): Promise<{ okay: boolean; result?: string }>;
}

interface CreateGetPox5DelegatedAmountQueryOptionsArgs {
  signerManagerContractId: string | undefined;
  cycle: number | undefined;
  pox5ContractId: string;
  client: Pox5DelegatedAmountReader;
}

export function createGetPox5DelegatedAmountQueryOptions({
  signerManagerContractId,
  cycle,
  pox5ContractId,
  client,
}: CreateGetPox5DelegatedAmountQueryOptionsArgs) {
  return {
    queryKey: ['pox5-delegated-amount', pox5ContractId, signerManagerContractId, cycle],
    enabled: !!signerManagerContractId && cycle !== undefined,
    staleTime: 60_000,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    async queryFn({ signal }: { signal: AbortSignal }): Promise<bigint | null> {
      if (!signerManagerContractId || cycle === undefined) return null;
      const pox5 = parseContractId(pox5ContractId);

      const res = await client.callReadOnlyFunction({
        contractAddress: pox5.contractAddress,
        contractName: pox5.contractName,
        functionName: 'get-amount-delegated-for-signer',
        readOnlyFunctionArgs: {
          arguments: [
            `0x${serializeCV(principalCV(signerManagerContractId))}`,
            `0x${serializeCV(uintCV(cycle))}`,
          ],
          sender: pox5.contractAddress,
        },
        signal,
      });

      if (!res.okay || !res.result) return null;
      const value = hexToCV(res.result);
      if (value.type !== ClarityType.UInt) return null;
      return BigInt(value.value);
    },
  };
}
