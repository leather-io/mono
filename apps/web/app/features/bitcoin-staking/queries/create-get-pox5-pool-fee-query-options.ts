import { hexToCV } from '@stacks/transactions';
import { z } from 'zod';
import { fetchFn } from '~/utils/hiro-wrapped-fetch';

import { parseContractId } from '../utils/contract-id';
import { decodeFeeBips } from '../utils/pool-fee';

const feesBipsVarName = 'fees-bips';
const poolFeeStaleTime = 5 * 60 * 1000;

const dataVarResponseSchema = z.object({ data: z.string() });

interface CreateGetPox5PoolFeeQueryOptionsArgs {
  signerManagerContractId: string | undefined;
  apiUrl: string;
}

export function createGetPox5PoolFeeQueryOptions({
  signerManagerContractId,
  apiUrl,
}: CreateGetPox5PoolFeeQueryOptionsArgs) {
  return {
    queryKey: ['pox5-pool-fee-bips', apiUrl, signerManagerContractId],
    enabled: !!signerManagerContractId,
    staleTime: poolFeeStaleTime,
    retry: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    async queryFn(): Promise<number | null> {
      if (!signerManagerContractId) return null;
      const { contractAddress, contractName } = parseContractId(signerManagerContractId);

      const res = await fetchFn(
        `${apiUrl}/v2/data_var/${contractAddress}/${contractName}/${feesBipsVarName}?proof=0`
      );
      if (!res.ok) return null;

      const body = dataVarResponseSchema.safeParse(await res.json());
      if (!body.success) return null;

      return decodeFeeBips(hexToCV(body.data.data));
    },
  };
}
