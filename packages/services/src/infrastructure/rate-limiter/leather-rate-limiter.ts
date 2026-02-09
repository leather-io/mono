import PQueue from 'p-queue';

import { RateLimiterQueueOptions } from './rate-limiter.service';

export const leatherApiLimiterSettings: RateLimiterQueueOptions = {
  interval: 1000,
  intervalCap: 20,
  timeout: 60000,
};

export const leatherApiLimiter: PQueue = new PQueue({
  ...leatherApiLimiterSettings,
});

export const leatherPriorityLevels = {
  LOW: 1,
  MEDIUM: 5,
  HIGH: 10,
};

export const leatherApiPriorities = {
  utxos: leatherPriorityLevels.MEDIUM,
  bitcoinTransactions: leatherPriorityLevels.LOW,
  bitcoinFeeRates: leatherPriorityLevels.LOW,
  fiatExchangeRates: leatherPriorityLevels.HIGH,
  nativeTokenPriceList: leatherPriorityLevels.HIGH,
  nativeTokenPriceMap: leatherPriorityLevels.HIGH,
  nativeTokenPrice: leatherPriorityLevels.HIGH,
  nativeTokenDescription: leatherPriorityLevels.MEDIUM,
  nativeTokenHistory: leatherPriorityLevels.MEDIUM,
  runePriceList: leatherPriorityLevels.HIGH,
  runePriceMap: leatherPriorityLevels.HIGH,
  runePrice: leatherPriorityLevels.HIGH,
  runeList: leatherPriorityLevels.MEDIUM,
  runeMap: leatherPriorityLevels.MEDIUM,
  rune: leatherPriorityLevels.MEDIUM,
  runeDescription: leatherPriorityLevels.MEDIUM,
  runeHistory: leatherPriorityLevels.MEDIUM,
  sip10PriceList: leatherPriorityLevels.HIGH,
  sip10PriceMap: leatherPriorityLevels.HIGH,
  sip10Price: leatherPriorityLevels.HIGH,
  sip10TokenList: leatherPriorityLevels.MEDIUM,
  sip10TokenMap: leatherPriorityLevels.MEDIUM,
  sip10Token: leatherPriorityLevels.MEDIUM,
  sip10TokenDescription: leatherPriorityLevels.MEDIUM,
  sip10TokenHistory: leatherPriorityLevels.MEDIUM,
  bitflowPoolsMap: leatherPriorityLevels.MEDIUM,
  zestReserve: leatherPriorityLevels.MEDIUM,
  registerAddresses: leatherPriorityLevels.LOW,
  graniteMarket: leatherPriorityLevels.MEDIUM,
  stackingDaoRates: leatherPriorityLevels.MEDIUM,
  nativeAnalyticsMap: leatherPriorityLevels.MEDIUM,
  nativeAnalytics: leatherPriorityLevels.MEDIUM,
  nativeDistribution: leatherPriorityLevels.MEDIUM,
  sip10AnalyticsMap: leatherPriorityLevels.MEDIUM,
  sip10Analytics: leatherPriorityLevels.MEDIUM,
  sip10Distribution: leatherPriorityLevels.MEDIUM,
  runeAnalyticsMap: leatherPriorityLevels.MEDIUM,
  runeAnalytics: leatherPriorityLevels.MEDIUM,
  runeDistribution: leatherPriorityLevels.MEDIUM,
};
