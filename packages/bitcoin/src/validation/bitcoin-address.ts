import { isValidBitcoinAddress } from './address-validation';
import { BitcoinError } from './bitcoin-error';

// Branded type for Bitcoin addresses
export type BitcoinAddress = string & { readonly __brand: unique symbol };

export function isBitcoinAddress(value: string): value is BitcoinAddress {
  try {
    isValidBitcoinAddress(value);
    return true;
  } catch {
    return false;
  }
}

// Function to create a BitcoinAddress
export function createBitcoinAddress(value: string): BitcoinAddress {
  if (!isBitcoinAddress(value)) {
    throw new BitcoinError('InvalidAddress');
  }

  return value;
}
