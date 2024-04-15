import { whenStacksChainId } from '@leather-wallet/stacks';
import { ChainID } from '@stacks/transactions';
import PQueue from 'p-queue';

import { useCurrentNetworkState } from '../leather-query-provider';

const hiroStacksMainnetApiLimiter = new PQueue({
  interval: 5000,
  intervalCap: 10,
  timeout: 60000,
});

const hiroStacksTestnetApiLimiter = new PQueue({
  concurrency: 20,
  interval: 60000,
  intervalCap: 20,
  timeout: 60000,
});

export function useHiroApiRateLimiter(): PQueue {
  const currentNetwork = useCurrentNetworkState();

  return whenStacksChainId(currentNetwork.chain.stacks.chainId)({
    [ChainID.Mainnet]: hiroStacksMainnetApiLimiter,
    [ChainID.Testnet]: hiroStacksTestnetApiLimiter,
  });
}
