import { hexToCV } from '@stacks/transactions';
import { z } from 'zod';
import { fetchFn } from '~/utils/hiro-wrapped-fetch';

import { parseContractId } from '../utils/contract-id';
import { Pox5PoolFee, decodeFeeBips, decodePendingFees, poolFeeFromBips } from '../utils/pool-fee';

const feesBipsVarName = 'fees-bips';
const pendingFeesFunctionName = 'get-pending-fees';
const poolFeeStaleTime = 5 * 60 * 1000;

const dataVarResponseSchema = z.object({ data: z.string() });
const callReadResponseSchema = z.object({
  okay: z.boolean(),
  result: z.string().optional(),
});

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
    async queryFn(): Promise<Pox5PoolFee | null> {
      if (!signerManagerContractId) return null;
      const { contractAddress, contractName } = parseContractId(signerManagerContractId);

      const pendingFeesRes = await fetchFn(
        `${apiUrl}/v2/contracts/call-read/${contractAddress}/${contractName}/${pendingFeesFunctionName}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sender: contractAddress, arguments: [] }),
        }
      );
      if (pendingFeesRes.ok) {
        const pendingFeesBody = callReadResponseSchema.safeParse(await pendingFeesRes.json());
        if (pendingFeesBody.success && pendingFeesBody.data.okay && pendingFeesBody.data.result) {
          const pendingFees = decodePendingFees(hexToCV(pendingFeesBody.data.result));
          if (pendingFees !== null) return pendingFees;
        }
      }

      const res = await fetchFn(
        `${apiUrl}/v2/data_var/${contractAddress}/${contractName}/${feesBipsVarName}?proof=0`
      );
      if (!res.ok) return null;

      const body = dataVarResponseSchema.safeParse(await res.json());
      if (!body.success) return null;

      const activeFeeBips = decodeFeeBips(hexToCV(body.data.data));
      return activeFeeBips === null ? null : poolFeeFromBips(activeFeeBips);
    },
  };
}
