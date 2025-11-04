import { daysInMs, hoursInMs, minutesInMs, secondsInMs, weeksInMs } from '@leather.io/utils';

import { HttpCacheOptions } from './http-cache.service';

export type HttpCacheKey =
  // BnsV2Client
  | 'bns-v2-api-name'
  | 'bns-v2-api-address-names'
  | 'bns-v2-api-zone-file-raw'
  | 'bns-v2-sdk-primary-name'

  // BestInSlotApiClient
  | 'bis-brc20-market-info'
  | 'bis-inscriptions'
  | 'bis-runes-valid-outputs'

  // GammaApiClient
  | 'gamma-api-get-stacks-nft'
  | 'gamma-api-get-stacks-collection'

  // StampchainApiClient
  | 'stampchain-api-stamps-by-address'

  // HiroStacksApiClient
  | 'hiro-stacks-get-address-balances'
  | 'hiro-stacks-get-address-stx-balance'
  | 'hiro-stacks-get-address-ft-balances'
  | 'hiro-stacks-get-address-transactions'
  | 'hiro-stacks-get-transaction-events'
  | 'hiro-stacks-get-address-mempool-transactions'
  | 'hiro-stacks-get-transaction-by-id'
  | 'hiro-stacks-get-nft-metadata'
  | 'hiro-stacks-get-nft-holdings'
  | 'hiro-stacks-call-read-only-function'
  | 'hiro-stacks-get-transfer-fee-rate'
  | 'hiro-stacks-get-transaction-fee-estimate'
  | 'hiro-stacks-get-api-status'

  // MempoolApiClient
  | 'mempool-api-address-utxos'
  | 'mempool-api-address-transactions'
  | 'mempool-api-transaction-by-txid'

  // LeatherApiClient
  | 'leather-api-utxos'
  | 'leather-api-bitcoin-descriptor-transactions'
  | 'leather-api-bitcoin-transaction-by-txid'
  | 'leather-api-usd-exchange-rates'
  | 'leather-api-bitcoin-fee-rates'
  | 'leather-api-native-token-price-list'
  | 'leather-api-native-token-price-map'
  | 'leather-api-native-token-price'
  | 'leather-api-native-token-description'
  | 'leather-api-native-token-history'
  | 'leather-api-rune-price-list'
  | 'leather-api-rune-price-map'
  | 'leather-api-rune-price'
  | 'leather-api-rune-list'
  | 'leather-api-rune-map'
  | 'leather-api-rune'
  | 'leather-api-rune-description'
  | 'leather-api-rune-history'
  | 'leather-api-sip10-price-list'
  | 'leather-api-sip10-price-map'
  | 'leather-api-sip10-price'
  | 'leather-api-sip10-token-list'
  | 'leather-api-sip10-token-map'
  | 'leather-api-sip10-token'
  | 'leather-api-sip10-token-description'
  | 'leather-api-sip10-token-history'
  | 'leather-api-bitflow-pools-map'
  | 'leather-api-zest-reserve'
  | 'leather-api-granite-market'
  | 'leather-api-stacking-dao-rates'
  | 'leather-api-register-notifications'
  | 'leather-api-swap-dexes'
  | 'leather-api-app-config'

  // BitflowSdkClient
  | 'bitflow-sdk-available-tokens'
  | 'bitflow-sdk-all-possible-token-y'
  | 'bitflow-sdk-get-quote-for-route'

  // AlexSdkClient
  | 'alex-sdk-fetch-swappable-currency'

  // VelarSdkClient
  | 'velar-sdk-get-tokens'
  | 'velar-sdk-get-token-pairs'
  | 'velar-sdk-get-computed-amount';

export const httpCacheConfig: Record<HttpCacheKey, HttpCacheOptions> = {
  'bns-v2-api-name': { ttl: minutesInMs(2) },
  'bns-v2-api-address-names': { ttl: minutesInMs(2) },
  'bns-v2-api-zone-file-raw': { ttl: minutesInMs(2) },
  'bns-v2-sdk-primary-name': { ttl: minutesInMs(2) },

  'bis-brc20-market-info': { ttl: minutesInMs(2) },
  'bis-inscriptions': { ttl: secondsInMs(30) },
  'bis-runes-valid-outputs': { ttl: secondsInMs(30) },

  'gamma-api-get-stacks-nft': { ttl: weeksInMs(8) },
  'gamma-api-get-stacks-collection': { ttl: weeksInMs(8) },

  'stampchain-api-stamps-by-address': { ttl: secondsInMs(30) },

  'hiro-stacks-get-address-balances': { ttl: secondsInMs(10) },
  'hiro-stacks-get-address-stx-balance': { ttl: secondsInMs(10) },
  'hiro-stacks-get-address-ft-balances': { ttl: secondsInMs(10) },
  'hiro-stacks-get-address-transactions': { ttl: secondsInMs(10) },
  'hiro-stacks-get-transaction-events': { ttl: secondsInMs(10) },
  'hiro-stacks-get-address-mempool-transactions': { ttl: secondsInMs(10) },
  'hiro-stacks-get-transaction-by-id': { ttl: secondsInMs(10) },
  'hiro-stacks-get-nft-metadata': { ttl: weeksInMs(8) },
  'hiro-stacks-get-nft-holdings': { ttl: secondsInMs(10) },
  'hiro-stacks-call-read-only-function': { ttl: secondsInMs(15) },
  'hiro-stacks-get-transfer-fee-rate': { ttl: secondsInMs(4) },
  'hiro-stacks-get-transaction-fee-estimate': { ttl: secondsInMs(4) },
  'hiro-stacks-get-api-status': { ttl: secondsInMs(10) },

  'mempool-api-address-utxos': { ttl: secondsInMs(5) },
  'mempool-api-address-transactions': { ttl: secondsInMs(5) },
  'mempool-api-transaction-by-txid': { ttl: secondsInMs(5) },

  'leather-api-utxos': { ttl: secondsInMs(10) },
  'leather-api-bitcoin-descriptor-transactions': { ttl: secondsInMs(10) },
  'leather-api-bitcoin-transaction-by-txid': { ttl: secondsInMs(10) },
  'leather-api-usd-exchange-rates': { ttl: daysInMs(1) },
  'leather-api-bitcoin-fee-rates': { ttl: secondsInMs(10) },
  'leather-api-native-token-price-list': { ttl: minutesInMs(5) },
  'leather-api-native-token-price-map': { ttl: minutesInMs(5) },
  'leather-api-native-token-price': { ttl: minutesInMs(5) },
  'leather-api-native-token-description': { ttl: daysInMs(1) },
  'leather-api-native-token-history': { ttl: minutesInMs(5) },
  'leather-api-rune-price-list': { ttl: minutesInMs(5) },
  'leather-api-rune-price-map': { ttl: minutesInMs(5) },
  'leather-api-rune-price': { ttl: minutesInMs(5) },
  'leather-api-rune-list': { ttl: daysInMs(1) },
  'leather-api-rune-map': { ttl: daysInMs(1) },
  'leather-api-rune': { ttl: daysInMs(30) },
  'leather-api-rune-description': { ttl: daysInMs(1) },
  'leather-api-rune-history': { ttl: minutesInMs(5) },
  'leather-api-sip10-price-list': { ttl: minutesInMs(5) },
  'leather-api-sip10-price-map': { ttl: minutesInMs(5) },
  'leather-api-sip10-price': { ttl: minutesInMs(5) },
  'leather-api-sip10-token-list': { ttl: daysInMs(1) },
  'leather-api-sip10-token-map': { ttl: daysInMs(1) },
  'leather-api-sip10-token': { ttl: daysInMs(30) },
  'leather-api-sip10-token-description': { ttl: daysInMs(1) },
  'leather-api-sip10-token-history': { ttl: minutesInMs(5) },
  'leather-api-bitflow-pools-map': { ttl: minutesInMs(30) },
  'leather-api-zest-reserve': { ttl: minutesInMs(10) },
  'leather-api-granite-market': { ttl: minutesInMs(10) },
  'leather-api-stacking-dao-rates': { ttl: minutesInMs(10) },
  'leather-api-register-notifications': { ttl: secondsInMs(10) },
  'leather-api-swap-dexes': { ttl: daysInMs(1) },
  'leather-api-app-config': { ttl: daysInMs(1) },

  'bitflow-sdk-available-tokens': { ttl: hoursInMs(6) },
  'bitflow-sdk-all-possible-token-y': { ttl: hoursInMs(1) },
  'bitflow-sdk-get-quote-for-route': { ttl: secondsInMs(30) },

  'alex-sdk-fetch-swappable-currency': { ttl: hoursInMs(6) },

  'velar-sdk-get-tokens': { ttl: hoursInMs(6) },
  'velar-sdk-get-token-pairs': { ttl: hoursInMs(1) },
  'velar-sdk-get-computed-amount': { ttl: secondsInMs(30) },
};
