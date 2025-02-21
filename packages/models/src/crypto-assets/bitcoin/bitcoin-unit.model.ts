export type BitcoinUnit = 'bitcoin' | 'satoshi';

export type BitcoinUnitSymbol = 'BTC' | 'sat';

export interface BitcoinUnitInfo {
  name: BitcoinUnit;
  symbol: BitcoinUnitSymbol;
  decimal: string;
}
