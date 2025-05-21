import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { z } from 'zod';

import { getStacksAssetStringParts } from '@leather.io/stacks';

import { useStacksClient } from '../stacks/stacks-client';

const emilyApiUrl = 'https://sbtc-emily.com';
const sbtcContractIdMainnet = 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token::sbtc-token';

const sbtcLimitsResponseSchema = z.object({
  pegCap: z.number().nullable(),
  perDepositCap: z.number().nullable(),
  perDepositMinimum: z.number().nullable(),
  perWithdrawalCap: z.number().nullable(),
  accountCaps: z.record(z.any()),
});

type GetSbtcLimitsResponse = z.infer<typeof sbtcLimitsResponseSchema>;

async function getSbtcLimits(apiUrl: string): Promise<GetSbtcLimitsResponse> {
  const resp = await axios.get(`${apiUrl}/limits`);
  return sbtcLimitsResponseSchema.parse(resp.data);
}

export function useGetSbtcLimits() {
  return useQuery({
    queryKey: ['get-sbtc-limits'],
    queryFn: () => getSbtcLimits(emilyApiUrl),
  });
}

export function useGetCurrentSbtcSupply() {
  const client = useStacksClient();
  const { contractAddress } = getStacksAssetStringParts(sbtcContractIdMainnet);

  return useQuery({
    queryKey: ['get-current-sbtc-supply', contractAddress],
    queryFn: () =>
      client.callReadOnlyFunction({
        contractAddress,
        contractName: 'sbtc-token',
        functionName: 'get-total-supply',
        readOnlyFunctionArgs: { sender: contractAddress, arguments: [] },
      }),
  });
}
