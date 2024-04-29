import { LiteralUnion } from './types.utils';

export type CryptoCurrencies = LiteralUnion<'BTC' | 'STX', string>;

export type FiatCurrencies = 'USD' | string;

export type Currencies = CryptoCurrencies | FiatCurrencies;
