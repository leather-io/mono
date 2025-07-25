import { FIAT_METADATA } from '../fiat-metadata';

const fiatCurrencyCodeList = new Set(FIAT_METADATA.map(currency => currency.code));

export function isFiatCurrencyCode(code: string) {
  return fiatCurrencyCodeList.has(code);
}
