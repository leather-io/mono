import {
  aeusdcPrincipal,
  longcoinPrincipal,
  lttPrincipal,
  sbtcAssetId,
  usdcxAssetId,
} from './sip10';

export const appConfig = {
  assets: {
    defaultEnabled: [
      `sip10|${longcoinPrincipal}::longcoin`,
      `sip10|${lttPrincipal}::leather-test-token`,
      `sip10|${sbtcAssetId}`,
      `sip10|${aeusdcPrincipal}::aeUSDC`,
      `sip10|${usdcxAssetId}`,
    ],
  },
  fees: {
    stacks: {
      minimumRelayFeeRate: 1,
      globalMaximumFee: 5000000,
      transfers: {
        low: { minimum: 180, default: 240, maximum: 299 },
        standard: { minimum: 300, default: 400, maximum: 800 },
        high: { minimum: 801, default: 901, maximum: 1001 },
      },
      contractCalls: {
        low: { minimum: 500, default: 1750, maximum: 2999 },
        standard: { minimum: 3000, default: 3750, maximum: 10000 },
        high: { minimum: 10001, default: 50001, maximum: 1000001 },
      },
      contractDeployments: {
        low: { minimum: 10000, default: 30000, maximum: 50000 },
        standard: { minimum: 50001, default: 100002, maximum: 500000 },
        high: { minimum: 1000001, default: 1500000, maximum: 2000001 },
      },
      sipTokenSends: {
        low: { minimum: 500, default: 600, maximum: 700 },
        standard: { minimum: 701, default: 1751, maximum: 4000 },
        high: { minimum: 4001, default: 4002, maximum: 10001 },
      },
    },
  },
};
