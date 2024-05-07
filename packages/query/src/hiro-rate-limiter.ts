import PQueue from 'p-queue';

import { useCurrentNetworkState } from './leather-query-provider';

const hiroStacksMainnetApiLimiter = new PQueue({
  interval: 60000,
  intervalCap: 100,
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

  switch (currentNetwork.mode) {
    case 'mainnet':
      return hiroStacksMainnetApiLimiter;
    case 'testnet':
      return hiroStacksTestnetApiLimiter;
  }
}
