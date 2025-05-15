import { daysInMs, minutesInMs, secondsInMs, weeksInMs } from '@leather.io/utils';

import { HttpCacheOptions } from './http-cache.service';

export type HttpCacheKey =
  // BestInSlotApiClient
  | 'bis-brc20-market-info'
  | 'bis-inscriptions'
  | 'bis-runes-valid-outputs'

  // HiroStacksApiClient
  | 'hiro-stacks-get-address-balances'
  | 'hiro-stacks-get-address-transactions'
  | 'hiro-stacks-get-transaction-events'
  | 'hiro-stacks-get-address-mempool-transactions'
  | 'hiro-stacks-get-nft-metadata'
  | 'hiro-stacks-get-nft-holdings'

  // LeatherApiClient
  | 'leather-api-utxos'
  | 'leather-api-transactions'
  | 'leather-api-fiat-exchange-rates'
  | 'leather-api-native-token-price-list'
  | 'leather-api-native-token-price-map'
  | 'leather-api-native-token-price'
  | 'leather-api-native-token-description'
  | 'leather-api-rune-price-list'
  | 'leather-api-rune-price-map'
  | 'leather-api-rune-price'
  | 'leather-api-rune-list'
  | 'leather-api-rune-map'
  | 'leather-api-rune'
  | 'leather-api-rune-description'
  | 'leather-api-sip10-price-list'
  | 'leather-api-sip10-price-map'
  | 'leather-api-sip10-price'
  | 'leather-api-sip10-token-list'
  | 'leather-api-sip10-token-map'
  | 'leather-api-sip10-token'
  | 'leather-api-sip10-token-description'
  | 'leather-api-register-notifications';

export const httpCacheConfig: Record<HttpCacheKey, HttpCacheOptions> = {
  'bis-brc20-market-info': { ttl: minutesInMs(2) },
  'bis-inscriptions': { ttl: secondsInMs(30) },
  'bis-runes-valid-outputs': { ttl: secondsInMs(30) },

  'hiro-stacks-get-address-balances': { ttl: secondsInMs(10) },
  'hiro-stacks-get-address-transactions': { ttl: secondsInMs(10) },
  'hiro-stacks-get-transaction-events': { ttl: secondsInMs(10) },
  'hiro-stacks-get-address-mempool-transactions': { ttl: secondsInMs(10) },
  'hiro-stacks-get-nft-metadata': { ttl: weeksInMs(8) },
  'hiro-stacks-get-nft-holdings': { ttl: secondsInMs(10) },

  'leather-api-utxos': { ttl: secondsInMs(10) },
  'leather-api-transactions': { ttl: secondsInMs(10) },
  'leather-api-fiat-exchange-rates': { ttl: daysInMs(1) },
  'leather-api-native-token-price-list': { ttl: minutesInMs(5) },
  'leather-api-native-token-price-map': { ttl: minutesInMs(5) },
  'leather-api-native-token-price': { ttl: minutesInMs(5) },
  'leather-api-native-token-description': { ttl: daysInMs(1) },
  'leather-api-rune-price-list': { ttl: minutesInMs(5) },
  'leather-api-rune-price-map': { ttl: minutesInMs(5) },
  'leather-api-rune-price': { ttl: minutesInMs(5) },
  'leather-api-rune-list': { ttl: daysInMs(1) },
  'leather-api-rune-map': { ttl: daysInMs(1) },
  'leather-api-rune': { ttl: daysInMs(30) },
  'leather-api-rune-description': { ttl: daysInMs(1) },
  'leather-api-sip10-price-list': { ttl: minutesInMs(5) },
  'leather-api-sip10-price-map': { ttl: minutesInMs(5) },
  'leather-api-sip10-price': { ttl: minutesInMs(5) },
  'leather-api-sip10-token-list': { ttl: daysInMs(1) },
  'leather-api-sip10-token-map': { ttl: daysInMs(1) },
  'leather-api-sip10-token': { ttl: daysInMs(30) },
  'leather-api-sip10-token-description': { ttl: daysInMs(1) },
  'leather-api-register-notifications': { ttl: secondsInMs(10) },
};
