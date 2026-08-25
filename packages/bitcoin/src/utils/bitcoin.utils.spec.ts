import { sha256 } from '@noble/hashes/sha256';
import { HDKey } from '@scure/bip32';
import * as btc from '@scure/btc-signer';
import { describe, expect, it } from 'vitest';

import { HD_KEY_VERSIONS_BY_NETWORK } from '@leather.io/constants';
import { deriveRootKeychainFromMnemonic } from '@leather.io/crypto';
import { testMnemonic } from '@leather.io/test-config';

import { deriveTaprootAccount } from '../payments/p2tr-address-gen';
import { deriveNativeSegwitAccountFromRootKeychain } from '../payments/p2wpkh-address-gen';
import { createBitcoinAddress } from '../validation/bitcoin-address';
import {
  deriveAddressIndexZeroFromAccount,
  ecdsaPublicKeyToSchnorr,
  encodeExtendedPublicKeyForNetwork,
  getInputPaymentType,
  getNativeSegwitAddress,
  getTaprootAddress,
  inferNetworkFromAddress,
  inferPaymentTypeFromAddress,
  isNativeSegwitDerivationPath,
  isTaprootDerivationPath,
  reencodeTestnetFamilyAddress,
} from './bitcoin.utils';

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

describe(encodeExtendedPublicKeyForNetwork.name, () => {
  const xpub =
    'xpub6D4nuUzLPukRYKmb6ZYxo5khwLJXHarYQutgauqv8UkAVV8NHw23UZPDoXdJZDqv5hHiyh55jCER2KuYt2a7Egnoj7TF8u7scsJbJPeCneM';

  it('should return mainnet encoded keys unchanged for mainnet', () => {
    expect(encodeExtendedPublicKeyForNetwork(xpub, 'mainnet')).toEqual(xpub);
  });

  it('should re-encode xpub as tpub for testnet flavored networks', () => {
    const tpub = encodeExtendedPublicKeyForNetwork(xpub, 'testnet');
    expect(tpub.startsWith('tpub')).toBeTruthy();
    expect(encodeExtendedPublicKeyForNetwork(xpub, 'regtest')).toEqual(tpub);
    expect(encodeExtendedPublicKeyForNetwork(xpub, 'signet')).toEqual(tpub);
  });

  it('should round trip between xpub and tpub', () => {
    const tpub = encodeExtendedPublicKeyForNetwork(xpub, 'testnet');
    expect(encodeExtendedPublicKeyForNetwork(tpub, 'mainnet')).toEqual(xpub);
    expect(encodeExtendedPublicKeyForNetwork(tpub, 'testnet')).toEqual(tpub);
  });

  it('should preserve the key material across re-encoding', () => {
    const tpub = encodeExtendedPublicKeyForNetwork(xpub, 'testnet');
    const mainnetKeychain = HDKey.fromExtendedKey(xpub);
    const testnetKeychain = HDKey.fromExtendedKey(tpub, HD_KEY_VERSIONS_BY_NETWORK.testnet);
    expect(testnetKeychain.publicKey).toEqual(mainnetKeychain.publicKey);
    expect(testnetKeychain.chainCode).toEqual(mainnetKeychain.chainCode);
  });
});

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

describe(getNativeSegwitAddress.name, async () => {
  const rootKeychain = await deriveRootKeychainFromMnemonic(testMnemonic);

  const nativeSegwitKeychain = deriveNativeSegwitAccountFromRootKeychain(rootKeychain, 'mainnet');
  it('creates mainnet receive address', () => {
    expect(
      getNativeSegwitAddress({
        network: 'mainnet',
        keychain: nativeSegwitKeychain(5).keychain,
        changeIndex: 0,
        addressIndex: 0,
      })
    ).toEqual('bc1q32mr73d2hynzw8wwdg58ek62fll0hsl8n9d2cn');
  });
  it('creates mainnet change address', () => {
    expect(
      getNativeSegwitAddress({
        network: 'mainnet',
        keychain: nativeSegwitKeychain(42).keychain,
        changeIndex: 1,
        addressIndex: 5,
      })
    ).toEqual('bc1qph55pqy085m9ktqz5w7c70dznkkjhyw2wpxh9t');
  });
  it('creates testnet change address', () => {
    expect(
      getNativeSegwitAddress({
        network: 'testnet',
        keychain: nativeSegwitKeychain(0).keychain,
        changeIndex: 1,
        addressIndex: 1,
      })
    ).toEqual('tb1qy4qarz6r4n283hez44sxrtanz6adkg04r86nlt');
  });
});

describe(getTaprootAddress.name, async () => {
  const rootKeychain = await deriveRootKeychainFromMnemonic(testMnemonic);
  const taprootKeychain = deriveTaprootAccount(rootKeychain, 'mainnet');
  it('creates mainnet receive address', () => {
    expect(
      getTaprootAddress({
        network: 'mainnet',
        keychain: taprootKeychain(5).keychain,
        changeIndex: 0,
        addressIndex: 0,
      })
    ).toEqual('bc1p3afedj4370xaqhj8yj5nv2pksh8xh2xzz5xdk5pg42twxh0xyx6ql4kwwk');
  });
  it('creates mainnet change address', () => {
    expect(
      getTaprootAddress({
        network: 'mainnet',
        keychain: taprootKeychain(42).keychain,
        changeIndex: 1,
        addressIndex: 5,
      })
    ).toEqual('bc1phj8a25u5wdvcc936uv3usu36l680jt2g3ddgc7thy6hu934e9ltqx7fmnk');
  });
  it('creates testnet change address', () => {
    expect(
      getTaprootAddress({
        network: 'testnet',
        keychain: taprootKeychain(0).keychain,
        changeIndex: 1,
        addressIndex: 1,
      })
    ).toEqual('tb1p7heq86wmpyj26fjt97yhuq2f5z6xk5nhhkc4xx64lu77ufsdhl0s73c6u5');
  });
});

describe(deriveAddressIndexZeroFromAccount.name, async () => {
  const rootKeychain = await deriveRootKeychainFromMnemonic(testMnemonic);
  const taprootKeychain = deriveTaprootAccount(rootKeychain, 'mainnet');
  const accountKeychain = taprootKeychain(0).keychain;
  const changeKeychain = accountKeychain.deriveChild(0);
  expect(accountKeychain.fingerprint).toBe(changeKeychain.parentFingerprint);

  const addressKeychain = deriveAddressIndexZeroFromAccount(accountKeychain);
  expect(changeKeychain.fingerprint).toBe(addressKeychain.parentFingerprint);
});

describe(isTaprootDerivationPath.name, () => {
  test('should correctly check taproot derivation path', () => {
    expect(isTaprootDerivationPath("m/86'/1'/3'/0/5")).toBe(true);
    expect(isTaprootDerivationPath("m/84'/0'/5'/1/7")).toBe(false);
  });
});

describe(isNativeSegwitDerivationPath.name, () => {
  test('should correctly check native segwit derivation path', () => {
    expect(isNativeSegwitDerivationPath("m/86'/1'/3'/0/5")).toBe(false);
    expect(isNativeSegwitDerivationPath("m/84'/0'/5'/1/7")).toBe(true);
  });
});

describe(reencodeTestnetFamilyAddress.name, () => {
  const testnetWshAddress = 'tb1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3q0sl5k7';
  const regtestWshAddress = 'bcrt1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3qzf4jry';
  const testnetSegwitAddress = 'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx';
  const regtestSegwitAddress = 'bcrt1qw508d6qejxtdg4y5r3zarvary0c5xw7kygt080';
  const testnetTaprootAddress = 'tb1pmfr3p9j00pfxjh0zmgp99y8zftmd3s5pmedqhyptwy6lm87hf5ssk79hv2';
  const regtestTaprootAddress = 'bcrt1pmfr3p9j00pfxjh0zmgp99y8zftmd3s5pmedqhyptwy6lm87hf5ssm803es';
  const mainnetWshAddress = 'bc1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3qccfmv3';

  it('should re-encode a testnet address for regtest', () => {
    expect(reencodeTestnetFamilyAddress(testnetWshAddress, 'regtest')).toBe(regtestWshAddress);
    expect(reencodeTestnetFamilyAddress(testnetSegwitAddress, 'regtest')).toBe(
      regtestSegwitAddress
    );
  });

  it('should re-encode a regtest address for testnet', () => {
    expect(reencodeTestnetFamilyAddress(regtestWshAddress, 'testnet')).toBe(testnetWshAddress);
    expect(reencodeTestnetFamilyAddress(regtestSegwitAddress, 'testnet')).toBe(
      testnetSegwitAddress
    );
  });

  it('should re-encode taproot addresses with bech32m', () => {
    expect(reencodeTestnetFamilyAddress(testnetTaprootAddress, 'regtest')).toBe(
      regtestTaprootAddress
    );
    expect(reencodeTestnetFamilyAddress(regtestTaprootAddress, 'testnet')).toBe(
      testnetTaprootAddress
    );
  });

  it('should re-encode a regtest address for signet with the tb prefix', () => {
    expect(reencodeTestnetFamilyAddress(regtestWshAddress, 'signet')).toBe(testnetWshAddress);
  });

  it('should return the same address when it already matches the target encoding', () => {
    expect(reencodeTestnetFamilyAddress(testnetWshAddress, 'testnet')).toBe(testnetWshAddress);
  });

  it('should return null for a mainnet target', () => {
    expect(reencodeTestnetFamilyAddress(testnetWshAddress, 'mainnet')).toBeNull();
  });

  it('should return null for a mainnet address', () => {
    expect(reencodeTestnetFamilyAddress(mainnetWshAddress, 'regtest')).toBeNull();
  });

  it('should return null for a base58 testnet address', () => {
    expect(
      reencodeTestnetFamilyAddress('mipcBbFg9gMiCh81Kj8tqqdgoZub1ZJRfn', 'regtest')
    ).toBeNull();
  });

  it('should return null for a bech32 address with an invalid checksum', () => {
    expect(
      reencodeTestnetFamilyAddress('tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsy', 'regtest')
    ).toBeNull();
  });
});

describe(getInputPaymentType.name, async () => {
  const rootKeychain = await deriveRootKeychainFromMnemonic(testMnemonic);
  const nativeSegwitPublicKey = deriveAddressIndexZeroFromAccount(
    deriveNativeSegwitAccountFromRootKeychain(rootKeychain, 'mainnet')(0).keychain
  ).publicKey;
  const taprootPublicKey = deriveAddressIndexZeroFromAccount(
    deriveTaprootAccount(rootKeychain, 'mainnet')(0).keychain
  ).publicKey;
  if (!nativeSegwitPublicKey || !taprootPublicKey) throw new Error('Expected public keys');

  function makeInput(script: Uint8Array, witnessScript?: Uint8Array) {
    return { index: 0, witnessUtxo: { amount: 1000n, script }, witnessScript };
  }

  it('returns p2wpkh for a native segwit input', () => {
    const input = makeInput(btc.p2wpkh(nativeSegwitPublicKey).script);
    expect(getInputPaymentType(input)).toBe('p2wpkh');
  });

  it('returns p2tr for a taproot input', () => {
    const input = makeInput(btc.p2tr(ecdsaPublicKeyToSchnorr(taprootPublicKey)).script);
    expect(getInputPaymentType(input)).toBe('p2tr');
  });

  it('returns p2wsh for a witness script input forging the p2wpkh scriptCode', () => {
    const witnessScript = btc.p2pkh(nativeSegwitPublicKey).script;
    const script = btc.OutScript.encode({ type: 'wsh', hash: sha256(witnessScript) });
    expect(getInputPaymentType(makeInput(script, witnessScript))).toBe('p2wsh');
  });

  it('throws for an input without a script', () => {
    expect(() => getInputPaymentType({ index: 0 })).toThrow('Input script cannot be empty');
  });
});
