import { useMemo } from 'react';

import { useQueries } from '@tanstack/react-query';
import { ProtocolSlug } from '~/features/stacking/start-liquid-stacking/utils/types-preset-protocols';
import { getNetworkInstanceByName } from '~/features/stacking/start-pooled-stacking/utils/utils-stacking-pools';
import { createGetDaoBalanceQueryOptions } from '~/queries/protocols/dao/balance';
import { createGetLisaBalanceQueryOptions } from '~/queries/protocols/lisa/balance';
import { CreateProtocolBalanceQueryOptionsParams } from '~/queries/protocols/protocol-types';
import { useStacksClient } from '~/queries/stacks/stacks-client';
import { useLeatherConnect } from '~/store/addresses';
import { useStacksNetwork } from '~/store/stacks-network';

export function useProtocolBalance(slug: ProtocolSlug) {
  const client = useStacksClient();
  const { stacksAccount } = useLeatherConnect();
  const address = stacksAccount?.address;

  const network = useStacksNetwork();
  const networkMode = getNetworkInstanceByName(network.networkName);

  const queryOptions = useMemo(() => {
    const options: CreateProtocolBalanceQueryOptionsParams = {
      address,
      client,
      networkMode,
      networkUrl: network.networkPreference.chain.stacks.url,
    };

    const queries = [];

    if (slug === 'stacking-dao') {
      queries.push(createGetDaoBalanceQueryOptions(options));
    }
    if (slug === 'lisa') {
      queries.push(createGetLisaBalanceQueryOptions(options));
    }

    return queries;
  }, [address, client, network.networkPreference.chain.stacks.url, networkMode, slug]);

  const results = useQueries({
    queries: queryOptions,
  });

  return results[0];
}
