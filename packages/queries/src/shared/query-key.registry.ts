export type QuerySettingsDep = 'currency' | 'network' | 'assetVisibility';

export type QueryPrefix = keyof typeof querySettingsDepsRegistry;

export const querySettingsDepsRegistry = {
  // market data
  'market-data-service--get-market-data': ['currency', 'network'],
  // balances
  'btc-balances-service--get-btc-account-balance': ['currency', 'network'],
  'btc-balances-service--get-btc-aggregate-balance': ['currency', 'network'],
  'sip10-balances-service--get-sip10-address-balance': ['currency', 'network', 'assetVisibility'],
  'sip10-balances-service--get-sip10-account-balance': ['currency', 'network', 'assetVisibility'],
} as const satisfies Record<string, readonly QuerySettingsDep[]>;
