export type QuerySettingsDep = 'currency' | 'network' | 'assetVisibility';

export type QueryPrefix = keyof typeof querySettingsDepsRegistry;

export const querySettingsDepsRegistry = {
  // market data
  'market-data-service--get-market-data': ['currency', 'network'],
  'market-data-service--get-market-data-by-asset-id': ['currency', 'network'],
  // market history
  'market-history-service--get-price-change-percentage': ['currency'],
  'market-history-service--get-price-history': ['currency'],
  // market stats
  'market-stats-service--get-market-stats': ['network'],
  'market-stats-service--get-market-stats-by-asset-id': ['network'],
  // token analytics
  'token-analytics-service--get-analytics': ['network'],
  'token-analytics-service--get-analytics-by-asset-id': ['network'],
  'token-analytics-service--get-distribution': ['network'],
  'token-analytics-service--get-distribution-by-asset-id': ['network'],
  // balances
  'btc-balances-service--get-btc-account-balance': ['currency', 'network'],
  'btc-balances-service--get-btc-aggregate-balance': ['currency', 'network'],
  'stx-balances-service--get-stx-account-balance': ['currency', 'network'],
  'stx-balances-service--get-stx-aggregate-balance': ['currency', 'network'],
  'stx-balances-service--get-stx-address-balance': ['currency', 'network'],
  'sip10-balances-service--get-sip10-balance-by-asset-id': ['currency', 'network'],
  'sip10-balances-service--get-sip10-address-balance': ['currency', 'network', 'assetVisibility'],
  'sip10-balances-service--get-sip10-account-balance': ['currency', 'network', 'assetVisibility'],
  'runes-balances-service--get-runes-account-balance': ['currency', 'network', 'assetVisibility'],
  'runes-balances-service--get-runes-aggregate-balance': ['currency', 'network', 'assetVisibility'],
  'runes-balances-service--get-rune-balance-by-rune-name': [
    'currency',
    'network',
    'assetVisibility',
  ],
  'account-balances-service--get-total-balance': ['currency', 'network', 'assetVisibility'],
  'account-balances-service--get-available-balance': ['currency', 'network', 'assetVisibility'],
  'account-balances-service--get-unlocked-balance': ['currency', 'network', 'assetVisibility'],
  // utxos
  'utxos-service--get-account-utxos': ['network'],
  // fungible asset info
  'fungible-asset-info-service--get-asset-description': [],
  // bns
  'bns-service--get-bns-name': [],
  'bns-service--get-account-primary-bns-profile': [],
  'bns-service--get-account-bns-names': [],
  // collectibles
  'collectibles-service--get-account-collectibles': [],
  // transactions
  'stacks-transactions-service--get-transaction-by-id': ['network'],
  'bitcoin-transactions-service--get-transaction-by-tx-id': ['network'],
  // activity
  'activity-service--get-activity': ['network'],
  'activity-service--get-activity-by-asset': ['network'],
  'activity-service--get-sip10-activity-by-asset-id': ['network'],
  'activity-service--get-sip10-total-activity-by-asset-id': ['network'],
  // asset list
  'asset-list-service--get-asset-list': ['currency', 'network', 'assetVisibility'],
} as const satisfies Record<string, readonly QuerySettingsDep[]>;
