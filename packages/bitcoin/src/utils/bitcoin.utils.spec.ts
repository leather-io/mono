import { describe, expect, it } from 'vitest';

import { createBitcoinAddress } from '../validation/bitcoin-address';
import { inferNetworkFromAddress, inferPaymentTypeFromAddress } from './bitcoin.utils';

describe(inferNetworkFromAddress.name, () => {
  it('should return "mainnet" for P2PKH mainnet addresses', () => {
    const mainnetAddress = createBitcoinAddress('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');
    expect(inferNetworkFromAddress(mainnetAddress)).toBe('mainnet');
  });

  it('should return "mainnet" for P2SH mainnet addresses', () => {
    const mainnetP2SHAddress = createBitcoinAddress('3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy');
    expect(inferNetworkFromAddress(mainnetP2SHAddress)).toBe('mainnet');
  });

  it('should return "mainnet" for Bech32 mainnet addresses', () => {
    const mainnetBech32Address = createBitcoinAddress('bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kygt080');
    expect(inferNetworkFromAddress(mainnetBech32Address)).toBe('mainnet');
  });

  it('should return "testnet" for P2PKH testnet addresses', () => {
    const testnetP2PKHAddress = createBitcoinAddress('mipcBbFg9gMiCh81Kj8tqqdgoZub1ZJRfn');
    expect(inferNetworkFromAddress(testnetP2PKHAddress)).toBe('testnet');
  });

  it('should return "testnet" for P2SH testnet addresses', () => {
    const testnetP2SHAddress = createBitcoinAddress('2NBFNJTktNa7GZusGbDbGKRZTxdK9VVez3n');
    expect(inferNetworkFromAddress(testnetP2SHAddress)).toBe('testnet');
  });

  it('should return "testnet" for Bech32 testnet addresses', () => {
    const testnetBech32Address = createBitcoinAddress(
      'tb1qxyzxyzxyzxyzxyzxyzxyzxyzxyzxyzxyzxyzxyz'
    );
    expect(inferNetworkFromAddress(testnetBech32Address)).toBe('testnet');
  });

  it('should return "regtest" for Bech32 regtest addresses', () => {
    const regtestBech32Address = createBitcoinAddress(
      'bcrt1qxyzxyzxyzxyzxyzxyzxyzxyzxyzxyzxyzxyzxyz'
    );
    expect(inferNetworkFromAddress(regtestBech32Address)).toBe('regtest');
  });

  it('should throw an error for invalid addresses', () => {
    const invalidAddress = createBitcoinAddress('invalidAddress');
    expect(() => inferNetworkFromAddress(invalidAddress)).toThrow(
      'Invalid or unsupported Bitcoin address format'
    );
  });
});
// Assuming the function is in a file named bitcoinLib.ts

describe(inferPaymentTypeFromAddress.name, () => {
  it('should return p2wpkh for mainnet P2WPKH address', () => {
    const address = createBitcoinAddress('bc1qxyzabc123'); // Example P2WPKH mainnet address
    expect(inferPaymentTypeFromAddress(address)).toBe('p2wpkh');
  });

  it('should return p2tr for mainnet P2TR address', () => {
    const address = createBitcoinAddress('bc1pxyzabc123'); // Example P2TR mainnet address
    expect(inferPaymentTypeFromAddress(address)).toBe('p2tr');
  });

  it('should return p2wpkh for testnet P2WPKH address', () => {
    const address = createBitcoinAddress('tb1qxyzabc123'); // Example P2WPKH testnet address
    expect(inferPaymentTypeFromAddress(address)).toBe('p2wpkh');
  });

  it('should return p2tr for testnet P2TR address', () => {
    const address = createBitcoinAddress('tb1pxyzabc123'); // Example P2TR testnet address
    expect(inferPaymentTypeFromAddress(address)).toBe('p2tr');
  });

  it('should return p2wpkh for regtest P2WPKH address', () => {
    const address = createBitcoinAddress('bcrt1qxyzabc123'); // Example P2WPKH regtest address
    expect(inferPaymentTypeFromAddress(address)).toBe('p2wpkh');
  });

  it('should return p2tr for regtest P2TR address', () => {
    const address = createBitcoinAddress('bcrt1pxyzabc123'); // Example P2TR regtest address
    expect(inferPaymentTypeFromAddress(address)).toBe('p2tr');
  });
});
