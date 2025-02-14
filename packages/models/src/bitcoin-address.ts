// Branded type for Bitcoin addresses
export type BitcoinAddress = string & { readonly __brand: unique symbol };

// Type guard function
export function isBitcoinAddress(value: string): value is BitcoinAddress {
  return true;
}

// Function to create a BitcoinAddress
export function createBitcoinAddress(value: string): BitcoinAddress {
  return value as BitcoinAddress; // Type assertion is necessary
}
