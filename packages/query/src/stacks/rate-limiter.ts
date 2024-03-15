import { whenStacksChainId } from '@leather-wallet/stacks';
import { ChainID } from '@stacks/transactions';
import { RateLimiter } from 'limiter';

import { useCurrentNetworkState } from '../leather-query-provider';

const hiroStacksMainnetApiLimiter = new RateLimiter({
  tokensPerInterval: 500,
  interval: 'minute',
});

const hiroStacksTestnetApiLimiter = new RateLimiter({
  tokensPerInterval: 100,
  interval: 'minute',
});

export function useHiroApiRateLimiter() {
  const currentNetwork = useCurrentNetworkState();

  return whenStacksChainId(currentNetwork.chain.stacks.chainId)({
    [ChainID.Mainnet]: hiroStacksMainnetApiLimiter,
    [ChainID.Testnet]: hiroStacksTestnetApiLimiter,
  });
}

export type { RateLimiter };
