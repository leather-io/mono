import type { CryptoAsset, Money } from '@leather.io/models';

export type ActivityAvatar = 'swap' | 'asset' | 'fallback';
export type ActivityStatusIndicatorId =
  | 'pending'
  | 'failed'
  | 'sent'
  | 'received'
  | 'swap'
  | 'function'
  | 'hidden';

export interface ActivityBalances {
  operator?: string;
  color?: string;
  crypto?: Money;
  quote?: Money;
}

export interface ActivityView {
  key: string;
  txid?: string;
  asset?: CryptoAsset;
  fromAsset?: CryptoAsset;
  toAsset?: CryptoAsset;
  title: string;
  caption: string;
  statusLabel: string | null;
  activityLink?: string | null;
  balances: ActivityBalances;
  activityAvatar: ActivityAvatar;
  statusIndicator: ActivityStatusIndicatorId;
}
