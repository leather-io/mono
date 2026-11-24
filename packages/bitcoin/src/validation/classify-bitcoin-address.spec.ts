import * as btc from '@scure/btc-signer';
import fc from 'fast-check';

import { getBtcSignerLibNetworkConfigByMode } from '../utils/bitcoin.network';
import { classifyBitcoinAddress } from './classify-bitcoin-address';

const runs = 1000;
const hash20 = fc.uint8Array({ minLength: 20, maxLength: 20 });
const hash32 = fc.uint8Array({ minLength: 32, maxLength: 32 });
const network = fc.constantFrom('mainnet', 'testnet', 'regtest');
const bech32Networks = fc.constantFrom('mainnet', 'testnet', 'regtest');

function encode(mode: 'mainnet' | 'testnet' | 'regtest', script: Uint8Array) {
  const config = getBtcSignerLibNetworkConfigByMode(mode);
  return btc.Address(config).encode(btc.OutScript.decode(script));
}

function attempt(address: string) {
  try {
    return classifyBitcoinAddress(address);
  } catch {
    return undefined;
  }
}

const xOnlyKey = '79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798';

describe(classifyBitcoinAddress.name, () => {
  test.each([
    ['1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2', 'mainnet', 'p2pkh'],
    ['3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy', 'mainnet', 'p2sh'],
    ['bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4', 'mainnet', 'p2wpkh'],
    ['bc1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3qccfmv3', 'mainnet', 'p2wsh'],
    ['bc1p5cyxnuxmeuwuvkwfem96lqzszd02n6xdcjrs20cac6yqjjwudpxqkedrcr', 'mainnet', 'p2tr'],
    ['tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx', 'testnet', 'p2wpkh'],
    ['mipcBbFg9gMiCh81Kj8tqqdgoZub1ZJRfn', 'testnet', 'p2pkh'],
    ['2MzQwSSnBHWHqSAqtTVQ6v47XtaisrJa1Vc', 'testnet', 'p2sh'],
    ['bcrt1qw508d6qejxtdg4y5r3zarvary0c5xw7kygt080', 'regtest', 'p2wpkh'],
  ])('classifies %s as %s %s', (address, expectedNetwork, type) => {
    expect(classifyBitcoinAddress(address)).toEqual({ network: expectedNetwork, type });
  });

  test.each([
    '',
    'not an address',
    'bc1qinvalid',
    '🔐',
    'BC1QW508D6QEJXTDG4Y5R3ZARVARY0C5XW7KV8F3T4',
    ' bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
    'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t5',
    '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN3',
    'bitcoin:bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
    'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
  ])('refuses %j', address => {
    expect(() => classifyBitcoinAddress(address)).toThrow(RangeError);
  });

  test('every native segwit address it was built from classifies back to the same network and type', () => {
    fc.assert(
      fc.property(bech32Networks, hash20, hash32, (mode, keyHash, scriptHash) => {
        expect(
          classifyBitcoinAddress(
            encode(mode, btc.OutScript.encode({ type: 'wpkh', hash: keyHash }))
          )
        ).toEqual({
          network: mode,
          type: 'p2wpkh',
        });
        expect(
          classifyBitcoinAddress(
            encode(mode, btc.OutScript.encode({ type: 'wsh', hash: scriptHash }))
          )
        ).toEqual({
          network: mode,
          type: 'p2wsh',
        });
      }),
      { numRuns: runs }
    );
  });

  test('legacy addresses classify back to their type; regtest shares testnet spelling', () => {
    fc.assert(
      fc.property(network, hash20, (mode, hash) => {
        const expectedNetwork = mode === 'regtest' ? 'testnet' : mode;
        expect(
          classifyBitcoinAddress(encode(mode, btc.OutScript.encode({ type: 'pkh', hash })))
        ).toEqual({
          network: expectedNetwork,
          type: 'p2pkh',
        });
        expect(
          classifyBitcoinAddress(encode(mode, btc.OutScript.encode({ type: 'sh', hash })))
        ).toEqual({
          network: expectedNetwork,
          type: 'p2sh',
        });
      }),
      { numRuns: runs }
    );
  });

  test('a taproot address classifies back to its network', () => {
    const modes: ('mainnet' | 'testnet' | 'regtest')[] = ['mainnet', 'testnet', 'regtest'];
    for (const mode of modes) {
      const address = btc.p2tr(
        Uint8Array.from(Buffer.from(xOnlyKey, 'hex')),
        undefined,
        getBtcSignerLibNetworkConfigByMode(mode)
      ).address;
      expect(address && classifyBitcoinAddress(address)).toEqual({ network: mode, type: 'p2tr' });
    }
  });

  test('changing any one character of an address makes it refused or a different address', () => {
    const base = 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4';
    fc.assert(
      fc.property(
        fc.nat({ max: base.length - 1 }),
        fc.constantFrom(...'qpzry9x8gf2tvdw0s3jn54khce6mua7lQ1bB '),
        (index, character) => {
          const changed = base.slice(0, index) + character + base.slice(index + 1);
          if (changed === base) return;
          expect(attempt(changed)).toBeUndefined();
        }
      ),
      { numRuns: runs }
    );
  });
});
