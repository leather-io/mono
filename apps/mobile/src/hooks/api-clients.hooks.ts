// from extension/src/app/store/common/api-clients.ts
import { useMemo } from 'react';

import { stacksClient, useCurrentNetworkState } from '@leather.io/query';

export function useStacksClient(): ReturnType<typeof stacksClient> {
  const network = useCurrentNetworkState();

  return useMemo(() => {
    return stacksClient(network.chain.stacks.url);
  }, [network.chain.stacks.url]);
}
