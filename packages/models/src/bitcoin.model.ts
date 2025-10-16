import { z } from 'zod';

// Branded type for Bitcoin addresses
export type BitcoinAddress = string & { readonly __brand: unique symbol };

export const bitcoinUnitSchema = z.enum(['bitcoin', 'satoshi']);
export type BitcoinUnit = z.infer<typeof bitcoinUnitSchema>;

export type BitcoinUnitSymbol = 'BTC' | 'sat';

export interface BitcoinUnitInfo {
  name: BitcoinUnit;
  symbol: BitcoinUnitSymbol;
  decimal: string;
}
