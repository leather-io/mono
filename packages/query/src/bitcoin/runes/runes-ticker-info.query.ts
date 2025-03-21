import PQueue from 'p-queue';

import { isDefined } from '@leather.io/utils';

import { BitcoinQueryPrefixes } from '../../query-prefixes';
import { RuneBalance } from '../clients/best-in-slot';
import { BitcoinClient } from '../clients/bitcoin-client';

const queryOptions = { staleTime: 5 * 60 * 1000 } as const;

interface CreateGetRunesTickerInfoQueryOptionsArgs {
  client: BitcoinClient;
  runeBalance: RuneBalance;
  runesEnabled: boolean;
  limiter: PQueue;
}
export function createGetRunesTickerInfoQueryOptions({
  client,
  runeBalance,
  runesEnabled,
  limiter,
}: CreateGetRunesTickerInfoQueryOptionsArgs) {
  return {
    enabled: isDefined(runeBalance) && runesEnabled,
    queryKey: [BitcoinQueryPrefixes.GetRunesTickerInfo, runeBalance.rune_name],
    queryFn: () =>
      limiter.add(() => client.BestInSlotApi.getRunesTickerInfo(runeBalance.rune_name), {
        throwOnTimeout: true,
      }),
    ...queryOptions,
  } as const;
}
