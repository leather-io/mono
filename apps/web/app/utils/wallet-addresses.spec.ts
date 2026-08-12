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

  test('recognizes testnet address prefixes', () => {
    const result = normalizeWalletAddresses([
      { address: 'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx' },
      { address: 'ST2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7' },
    ]);
    expect(result).toEqual([
      expect.objectContaining({ symbol: 'BTC', type: 'p2wpkh' }),
      expect.objectContaining({ symbol: 'STX' }),
    ]);
  });

  test('leaves the bitcoin type undefined when it cannot be derived', () => {
    const result = normalizeWalletAddresses([{ address: '3P14159f73E4gFr7JterCCQh9QjiTjiZrG' }]);
    expect(result).toEqual([expect.objectContaining({ symbol: 'BTC', type: undefined })]);
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
