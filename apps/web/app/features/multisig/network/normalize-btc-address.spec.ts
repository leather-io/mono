import { describe, expect, test } from 'vitest';

import { normalizeNativeSegwitAddress } from './normalize-btc-address';

const mainnetP2wpkh = 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4';
const testnetP2wpkh = 'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx';
const regtestP2wpkh = 'bcrt1qw508d6qejxtdg4y5r3zarvary0c5xw7kygt080';
const testnetP2tr = 'tb1p0xlxvlhemja6c4dqv22uapctqupfhlxm9h8z3k2e72q4k9hcz7vq47zagq';

describe(normalizeNativeSegwitAddress.name, () => {
  test('re-encodes a testnet p2wpkh address for regtest', () => {
    expect(normalizeNativeSegwitAddress(testnetP2wpkh, 'regtest')).toBe(regtestP2wpkh);
  });

  test('re-encodes a regtest p2wpkh address for testnet', () => {
    expect(normalizeNativeSegwitAddress(regtestP2wpkh, 'testnet')).toBe(testnetP2wpkh);
  });

  test('returns a mainnet p2wpkh address unchanged for mainnet', () => {
    expect(normalizeNativeSegwitAddress(mainnetP2wpkh, 'mainnet')).toBe(mainnetP2wpkh);
  });

  test('does not convert a testnet address to mainnet', () => {
    expect(normalizeNativeSegwitAddress(testnetP2wpkh, 'mainnet')).toBe(testnetP2wpkh);
  });

  test('does not convert a regtest address to mainnet', () => {
    expect(normalizeNativeSegwitAddress(regtestP2wpkh, 'mainnet')).toBe(regtestP2wpkh);
  });

  test('does not convert a mainnet address to testnet', () => {
    expect(normalizeNativeSegwitAddress(mainnetP2wpkh, 'testnet')).toBe(mainnetP2wpkh);
  });

  test('does not convert a mainnet address to regtest', () => {
    expect(normalizeNativeSegwitAddress(mainnetP2wpkh, 'regtest')).toBe(mainnetP2wpkh);
  });

  test('returns a non-p2wpkh address unchanged', () => {
    expect(normalizeNativeSegwitAddress(testnetP2tr, 'regtest')).toBe(testnetP2tr);
  });

  test('returns an invalid address unchanged', () => {
    expect(normalizeNativeSegwitAddress('not-an-address', 'testnet')).toBe('not-an-address');
  });
});
