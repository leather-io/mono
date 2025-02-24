import { BitcoinAddress } from '@leather.io/models';

import { isValidBitcoinAddress } from './address-validation';
import { BitcoinError } from './bitcoin-error';

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
