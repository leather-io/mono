import { useStacksNetwork } from '~/store/stacks-network';

import { type StacksClient, stacksClient } from '@leather.io/query';

export function useStacksClient(): StacksClient {
  const { networkPreference } = useStacksNetwork();
  return stacksClient(networkPreference.chain.stacks.url);
}
