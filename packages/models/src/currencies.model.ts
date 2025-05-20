import { LiteralUnion } from './types.utils';

export type CryptoCurrency = LiteralUnion<'BTC' | 'STX', string>;

export type QuoteCurrency = LiteralUnion<
  'USD' | 'EUR' | 'GBP' | 'AUD' | 'CAD' | 'CNY' | 'JPY' | 'KRW' | 'BTC',
  string
>;

export type Currency = CryptoCurrency | QuoteCurrency;
