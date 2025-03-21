import { type StacksClient, stacksClient } from '@leather.io/query';

import { useLeatherNetwork } from '../leather-query-provider';

export function useStacksClient(): StacksClient {
  const network = useLeatherNetwork();
  return stacksClient(network.chain.stacks.url);
}
