import PQueue from 'p-queue';

import { BITCOIN_API_BASE_URL_TESTNET3 } from '@leather.io/models';

const bitcoinMainnetApiLimiter = new PQueue({
  interval: 5000,
  intervalCap: 30,
});

const bitcoinTestnetApiLimiter = new PQueue({
  interval: 5000,
  intervalCap: 30,
});

export function getBitcoinRatelimiter(url: string): PQueue {
  if (url.includes(BITCOIN_API_BASE_URL_TESTNET3)) return bitcoinTestnetApiLimiter;
  return bitcoinMainnetApiLimiter;
}
