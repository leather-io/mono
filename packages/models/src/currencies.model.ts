import { LiteralUnion } from './types.utils';

export type CryptoCurrency = LiteralUnion<'BTC' | 'STX', string>;

export type FiatCurrency = LiteralUnion<
  'USD' | 'EUR' | 'GBP' | 'AUD' | 'CAD' | 'CNY' | 'JPY' | 'KRW',
  string
>;

export type Currency = CryptoCurrency | FiatCurrency;
