import { useMemo } from 'react';

import { useQueries } from '@tanstack/react-query';
import { ProtocolSlug } from '~/features/stacking/start-liquid-stacking/utils/types-preset-protocols';
import { getNetworkInstanceByName } from '~/features/stacking/start-pooled-stacking/utils/utils-stacking-pools';
import { createGetDaoFeeQueryOptions } from '~/queries/protocols/dao/fee';
import { CreateProtocolFeeQueryOptionsParams } from '~/queries/protocols/protocol-types';
import { useStacksClient } from '~/queries/stacks/stacks-client';
import { useLeatherConnect } from '~/store/addresses';
import { useStacksNetwork } from '~/store/stacks-network';

export function useProtocolFee(slug: ProtocolSlug) {
  const client = useStacksClient();
  const { stacksAccount } = useLeatherConnect();
  const address = stacksAccount?.address;

  const network = useStacksNetwork();
  const networkMode = getNetworkInstanceByName(network.networkName);

  const queryOptions = useMemo(() => {
    const options: CreateProtocolFeeQueryOptionsParams = {
      address,
      client,
      networkMode,
    };

    const queries = [];

    if (slug === 'stacking-dao') {
      queries.push(createGetDaoFeeQueryOptions(options));
    }

    return queries;
  }, [address, client, networkMode, slug]);

  const results = useQueries({
    queries: queryOptions,
  });

  return results[0];
}
