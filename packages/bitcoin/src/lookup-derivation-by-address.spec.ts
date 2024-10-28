import { deriveRootKeychainFromMnemonic } from '@leather.io/crypto';

import { testMnemonic } from '../../../config/test-helpers';
import { lookupDerivationByAddress } from './lookup-derivation-by-address';
import { deriveTaprootAccount } from './p2tr-address-gen';
import { deriveNativeSegwitAccountFromRootKeychain } from './p2wpkh-address-gen';

describe(lookupDerivationByAddress.name, async () => {
  const rootKeychain = await deriveRootKeychainFromMnemonic(testMnemonic);

  const taprootKeychain = deriveTaprootAccount(rootKeychain, 'mainnet');
  const nativeSegwitKeychain = deriveNativeSegwitAccountFromRootKeychain(rootKeychain, 'mainnet');

  describe('Account zero', () => {
    const firstTaprootAccountKeychain = taprootKeychain(0);
    const firstNativeSegwitAccountKeychain = nativeSegwitKeychain(0);

    const testSpecs = [
      ['bc1qzq7wjutswcp4r606tm0uxz9f9u3xx7cumxjeec', `m/84'/0'/0'/0/0`],
      ['bc1qp97df35dn0qqpe6q8xdzvzneqz9eljqh5zywgh', `m/84'/0'/0'/0/1`],
      ['bc1q8mkefvrphuetcn5g7katv88qnghl3tu9ztcs03', `m/84'/0'/0'/0/2`],
      ['bc1qpu0qy667fsmmn5ewwa6m3cf34htyjh8fn5hyhz', `m/84'/0'/0'/0/3`],
      ['bc1qnpyy7pnlxq4rxjzzfzvu9yfqdrtljl49x494fe', `m/84'/0'/0'/0/10`],
      ['bc1qgdk3qzr6h3z0krvgfvqr7rjyh36w8l30rp3ed3', `m/84'/0'/0'/0/20`],
      ['bc1q3ye9a8fgztr5yz0ze5sd83t3yr34p8ge2p0cuu', `m/84'/0'/0'/0/99`],

      ['bc1p0svqqvsaxtu5te5nxpq8qa9xg89rrenfg4xxvkhlqcu7hhrwzl9qgr0dya', `m/86'/0'/0'/0/0`],
      ['bc1p6jqgn9flqa6wne3tdnrs74qtay08s65j6ssytnm5n2qha8mg074q9quds8', `m/86'/0'/0'/0/1`],
      ['bc1pjx8encydxcr76dncd2j3vwsl46ta37y5gmmtlav6w0958ng8te7ssucq9r', `m/86'/0'/0'/0/2`],
    ];

    test.each(testSpecs)('test address %s at index %s', (address, path) => {
      const lookup = lookupDerivationByAddress({
        taprootXpub: firstTaprootAccountKeychain.keychain.publicExtendedKey,
        nativeSegwitXpub: firstNativeSegwitAccountKeychain.keychain.publicExtendedKey,
        iterationLimit: 100,
      });
      expect(lookup(address).path).toEqual(path);
    });
  });

  describe('Account one and above', () => {
    const firstTaprootAccountKeychain = taprootKeychain(1);
    const firstNativeSegwitAccountKeychain = nativeSegwitKeychain(1);

    test('that it finds the correct address', () => {
      const lookup = lookupDerivationByAddress({
        taprootXpub: firstTaprootAccountKeychain.keychain.publicExtendedKey,
        nativeSegwitXpub: firstNativeSegwitAccountKeychain.keychain.publicExtendedKey,
        iterationLimit: 10,
      });

      expect(lookup('bc1qvgtk702cayady9wvkhvs5jn8c2ldurhazx9nzf').path).toBe(`m/84'/0'/1'/0/0`);
    });
  });

  describe('Failure case', () => {
    const firstTaprootAccountKeychain = taprootKeychain(1);
    const firstNativeSegwitAccountKeychain = nativeSegwitKeychain(1);

    test('that it finds the correct address', () => {
      const lookup = lookupDerivationByAddress({
        taprootXpub: firstTaprootAccountKeychain.keychain.publicExtendedKey,
        nativeSegwitXpub: firstNativeSegwitAccountKeychain.keychain.publicExtendedKey,
        iterationLimit: 10,
      });

      expect(lookup('bc1qvgsomefakeaddressitwontfind').status).toBe('failure');
    });
  });
});
