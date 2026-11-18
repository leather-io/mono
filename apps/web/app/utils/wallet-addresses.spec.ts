import { normalizeWalletAddresses } from './wallet-addresses';

const leatherNativeSegwitEntry = {
  symbol: 'BTC',
  type: 'p2wpkh',
  address: 'bc1qs0kkdpsrzh3ngqgth7mkavlwlzr7lms2zv3wxe',
  publicKey: '02'.repeat(33),
  derivationPath: "m/84'/0'/0'/0/0",
  descriptor: `wpkh([deadbeef/84'/0'/0']xpub123/0/0)`,
  fingerprint: 'deadbeef',
};

const leatherTaprootEntry = {
  symbol: 'BTC',
  type: 'p2tr',
  address: 'bc1p5cyxnuxmeuwuvkwfem96lqzszd02n6xdcjrs20cac6yqjjwudpxqkedrcr',
  publicKey: '03'.repeat(33),
  tweakedPublicKey: '04'.repeat(32),
  derivationPath: "m/86'/0'/0'/0/0",
  descriptor: `tr([deadbeef/86'/0'/0']xpub456/0/0)`,
  fingerprint: 'deadbeef',
};

const leatherStacksEntry = {
  symbol: 'STX',
  kind: 'single-sig',
  address: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
  publicKey: '05'.repeat(33),
};

describe(normalizeWalletAddresses.name, () => {
  test('keeps full-fidelity Leather entries verbatim', () => {
    const result = normalizeWalletAddresses([
      leatherNativeSegwitEntry,
      leatherTaprootEntry,
      leatherStacksEntry,
    ]);
    expect(result).toEqual([leatherNativeSegwitEntry, leatherTaprootEntry, leatherStacksEntry]);
  });

  test('derives symbol and type for generic wallet entries', () => {
    const result = normalizeWalletAddresses([
      {
        address: 'bc1qs0kkdpsrzh3ngqgth7mkavlwlzr7lms2zv3wxe',
        publicKey: '02'.repeat(33),
        purpose: 'payment',
      },
      {
        address: 'bc1p5cyxnuxmeuwuvkwfem96lqzszd02n6xdcjrs20cac6yqjjwudpxqkedrcr',
        publicKey: '03'.repeat(33),
        purpose: 'ordinals',
      },
      {
        address: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
        publicKey: '05'.repeat(33),
        purpose: 'stacks',
      },
    ]);
    expect(result).toEqual([
      expect.objectContaining({ symbol: 'BTC', type: 'p2wpkh' }),
      expect.objectContaining({ symbol: 'BTC', type: 'p2tr' }),
      expect.objectContaining({
        symbol: 'STX',
        address: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
      }),
    ]);
  });

  test('prefers explicit address type fields over address-prefix derivation', () => {
    const result = normalizeWalletAddresses([
      { address: '3P14159f73E4gFr7JterCCQh9QjiTjiZrG', addressType: 'p2wpkh' },
    ]);
    expect(result).toEqual([expect.objectContaining({ symbol: 'BTC', type: 'p2wpkh' })]);
  });

  test('recognizes testnet addresses', () => {
    const result = normalizeWalletAddresses([
      { address: 'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx' },
      { address: 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG' },
    ]);
    expect(result).toEqual([
      expect.objectContaining({ symbol: 'BTC', type: 'p2wpkh' }),
      expect.objectContaining({ symbol: 'STX' }),
    ]);
  });

  test('classifies p2sh payment addresses', () => {
    const result = normalizeWalletAddresses([
      { address: '3P14159f73E4gFr7JterCCQh9QjiTjiZrG' },
      { address: '2N3wh1eYqMeqoLxuKFv8PBsYR4f8gYn8dHm' },
    ]);
    expect(result).toEqual([
      expect.objectContaining({ symbol: 'BTC', type: 'p2sh' }),
      expect.objectContaining({ symbol: 'BTC', type: 'p2sh' }),
    ]);
  });

  test('drops entries that are neither valid stacks nor bitcoin addresses', () => {
    const result = normalizeWalletAddresses([
      { address: 'SPAMJUNKNOTANADDRESS' },
      { address: 'ST2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7' },
      { address: 'nope' },
    ]);
    expect(result).toEqual([]);
  });

  test('keeps entries whose type is null', () => {
    const result = normalizeWalletAddresses([
      { address: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7', type: null, addressType: null },
      { address: 'bc1qs0kkdpsrzh3ngqgth7mkavlwlzr7lms2zv3wxe', type: null, addressType: null },
    ]);
    expect(result).toEqual([
      expect.objectContaining({ symbol: 'STX' }),
      expect.objectContaining({ symbol: 'BTC', type: 'p2wpkh' }),
    ]);
  });

  test('keeps entries whose publicKey is null', () => {
    const result = normalizeWalletAddresses([
      { address: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7', publicKey: null },
      { address: 'bc1qs0kkdpsrzh3ngqgth7mkavlwlzr7lms2zv3wxe', publicKey: null },
    ]);
    expect(result).toEqual([
      {
        symbol: 'STX',
        address: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
        publicKey: undefined,
      },
      {
        symbol: 'BTC',
        address: 'bc1qs0kkdpsrzh3ngqgth7mkavlwlzr7lms2zv3wxe',
        publicKey: undefined,
        type: 'p2wpkh',
      },
    ]);
  });

  test('drops entries without a usable address', () => {
    expect(normalizeWalletAddresses([{ address: '' }, {}, null, 'nope'])).toEqual([]);
  });
});
