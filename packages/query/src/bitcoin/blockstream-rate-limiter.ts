import { BITCOIN_API_BASE_URL_TESTNET } from '@leather-wallet/models';
import PQueue from 'p-queue';

const blockstreamMainnetApiLimiter = new PQueue({
  interval: 5000,
  intervalCap: 30,
});

const blockstreamTestnetApiLimiter = new PQueue({
  interval: 5000,
  intervalCap: 30,
});

export function getBlockstreamRatelimiter(url: string): PQueue {
  if (url.includes(BITCOIN_API_BASE_URL_TESTNET)) return blockstreamTestnetApiLimiter;
  return blockstreamMainnetApiLimiter;
}
