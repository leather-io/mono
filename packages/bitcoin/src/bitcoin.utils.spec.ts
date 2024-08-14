import { makeBitcoinDerivationPath } from './bitcoin.utils';

describe(makeBitcoinDerivationPath.name, () => {
  test('should create a taproot signet derivation path', () => {
    const path = makeBitcoinDerivationPath('p2tr', 'signet', 0, 0);
    expect(path).toBe("m/86'/1'/0'/0/0");
  });

  test('should create a native segwit mainnet derivation path', () => {
    const path = makeBitcoinDerivationPath('p2wpkh', 'mainnet', 0, 0);
    expect(path).toBe("m/84'/0'/0'/0/0");
  });
});
