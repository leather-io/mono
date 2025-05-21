import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { z } from 'zod';
import { useLeatherConnect } from '~/store/addresses';

import { getStacksAssetStringParts } from '@leather.io/stacks';

import { useStacksClient } from '../stacks/stacks-client';

const emilyApiUrl = 'https://sbtc-emily.com';
const sbtcContractIdMainnet = 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token::sbtc-token';

export const defaultSbtcLimits = {
  pegCap: 1000000000000,
  perDepositCap: 100000000,
  perDepositMinimum: 100000,
  perWithdrawalCap: 100000000,
  accountCaps: {},
};

const sbtcLimitsResponseSchema = z.object({
  pegCap: z.number().nullable(),
  perDepositCap: z.number().nullable(),
  perDepositMinimum: z.number().nullable(),
  perWithdrawalCap: z.number().nullable(),
  accountCaps: z.record(z.any()),
});

type GetSbtcLimitsResponse = z.infer<typeof sbtcLimitsResponseSchema>;

async function getSbtcLimits(apiUrl: string): Promise<GetSbtcLimitsResponse> {
  const resp = await axios.get(`${apiUrl}/limits`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
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
  const { stacksAccount } = useLeatherConnect();
  const address = stacksAccount?.address;

  return useQuery({
    enabled: !!address,
    queryKey: ['get-current-sbtc-supply', contractAddress, address],
    queryFn: () =>
      client.callReadOnlyFunction({
        contractAddress,
        contractName: 'sbtc-token',
        functionName: 'get-total-supply',
        readOnlyFunctionArgs: { sender: address ?? '', arguments: [] },
      }),
  });
}
