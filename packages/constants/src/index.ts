import type { BitcoinUnit, BitcoinUnitInfo } from '@leather.io/models';

export const gaiaUrl = 'https://hub.blockstack.org';

export const ZERO_INDEX = 0;

export const HIRO_EXPLORER_URL = 'https://explorer.hiro.so';
export const ORD_IO_URL = 'https://ord.io';

export const HIGH_FEE_AMOUNT_STX = 5;
export const HIGH_FEE_WARNING_LEARN_MORE_URL_BTC = 'https://bitcoinfees.earn.com/';
export const HIGH_FEE_WARNING_LEARN_MORE_URL_STX =
  'https://leather.gitbook.io/guides/transactions/fees';

export const DEFAULT_FEE_RATE = 400;

export const PERSISTENCE_CACHE_TIME = 1000 * 60 * 60 * 12; // 12 hours

export const BTC_DECIMALS = 8;
export const STX_DECIMALS = 6;

// Units of `Money` should be declared in their smallest unit. Similar to
// Rosetta, we model currencies with their respective resolution
export const currencyDecimalsMap = {
  BTC: BTC_DECIMALS,
  STX: STX_DECIMALS,
  USD: 2,
  EUR: 2,
  GBP: 2,
  AUD: 2,
  CAD: 2,
  CNY: 2,
  JPY: 0,
  KRW: 0,
} as const;

export const currencyNameMap = {
  USD: 'united states dollar',
  EUR: 'euro',
  GBP: 'british pound',
  AUD: 'australian dollar',
  CAD: 'canadian dollar',
  CNY: 'chinese yuan',
  JPY: 'japanese yen',
  KRW: 'south korean won',
} as const;

// https://bitcoin.stackexchange.com/a/41082/139277
export const BTC_P2WPKH_DUST_AMOUNT = 294;

export const KEBAB_REGEX = /[A-Z\u00C0-\u00D6\u00D8-\u00DE]/g;

export const DEFAULT_LIST_LIMIT = 50;

export const TOKEN_NAME_LENGTH = 4;

export const LEATHER_SUPPORT_URL = 'https://leather.io/contact';

export const bitcoinUnitsKeyedByName: Record<BitcoinUnit, BitcoinUnitInfo> = {
  bitcoin: {
    name: 'bitcoin',
    symbol: 'BTC',
    decimal: '1',
  },
  satoshi: {
    name: 'satoshi',
    symbol: 'sat',
    decimal: '0.00000001',
  },
};
