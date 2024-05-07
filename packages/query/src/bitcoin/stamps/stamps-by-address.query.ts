import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { z } from 'zod';

import { AppUseQueryConfig } from '../../query-config';
import { QueryPrefixes } from '../../query-prefixes';

const stampSchema = z.object({
  stamp: z.number(),
  block_index: z.number(),
  cpid: z.string(),
  asset_longname: z.string(),
  creator: z.string(),
  divisible: z.number(),
  keyburn: z.number(),
  locked: z.number(),
  message_index: z.number(),
  stamp_base64: z.string(),
  stamp_mimetype: z.string(),
  stamp_url: z.string(),
  supply: z.number(),
  timestamp: z.string(),
  tx_hash: z.string(),
  tx_index: z.number(),
  src_data: z.string(),
  ident: z.string(),
  creator_name: z.string(),
  stamp_gen: z.string(),
  stamp_hash: z.string(),
  is_btc_stamp: z.number(),
  is_reissue: z.number(),
  file_hash: z.string(),
});

export type Stamp = z.infer<typeof stampSchema>;

const src20TokenSchema = z.object({
  id: z.string(),
  address: z.string(),
  cpid: z.string(),
  p: z.string(),
  tick: z.string(),
  amt: z.number(),
  block_time: z.string(),
  last_update: z.number(),
});

export type Src20Token = z.infer<typeof src20TokenSchema>;

const stampsByAdressSchema = z.object({
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
  total: z.number(),
  last_block: z.number().optional(),
  btc: z.object({
    address: z.string(),
    balance: z.number(),
    txCount: z.number(),
    unconfirmedBalance: z.number(),
    unconfirmedTxCount: z.number(),
  }),
  data: z.object({
    stamps: z.array(stampSchema),
    src20: z.array(src20TokenSchema),
  }),
});

type StampsByAddressQueryResponse = z.infer<typeof stampsByAdressSchema>;

/**
 * @see https://stampchain.io/docs#/default/get_api_v2_balance__address_
 */
async function fetchStampsByAddress(address: string): Promise<StampsByAddressQueryResponse> {
  const resp = await axios.get<StampsByAddressQueryResponse>(
    `https://stampchain.io/api/v2/balance/${address}`
  );
  return stampsByAdressSchema.parse(resp.data);
}

type FetchStampsByAddressResp = Awaited<ReturnType<typeof fetchStampsByAddress>>;

export function useStampsByAddressQuery<T extends unknown = FetchStampsByAddressResp>(
  address: string,
  options?: AppUseQueryConfig<FetchStampsByAddressResp, T>
) {
  return useQuery({
    queryKey: [QueryPrefixes.StampsByAddress, address],
    queryFn: () => fetchStampsByAddress(address),
    refetchOnWindowFocus: false,
    ...options,
  });
}
