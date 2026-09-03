import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex } from '@noble/hashes/utils';
import { HDKey } from '@scure/bip32';
import { describe, expect, it } from 'vitest';

import { compileWshDescriptor, findAccountDescriptorKey } from '@leather.io/bitcoin';

import {
  descriptorHasNonAccountRawKey,
  isLedgerOnDeviceAddressConfirmed,
  toLedgerDisplayedAddress,
} from './ledger-descriptor-address';

function makeNativeSegwitAccountKeychain(seedByte: number) {
  return HDKey.fromMasterSeed(new Uint8Array(32).fill(seedByte)).derive("m/84'/0'/0'");
}

function makeNativeSegwitAccountXpub(seedByte: number) {
  return makeNativeSegwitAccountKeychain(seedByte).publicExtendedKey;
}

function makeNativeSegwitAddressPubkey(seedByte: number) {
  return makeNativeSegwitAccountKeychain(seedByte).deriveChild(0).deriveChild(0).publicKey!;
}

const xpubA = makeNativeSegwitAccountXpub(1);
const xpubB = makeNativeSegwitAccountXpub(2);

const mainnetWshAddress = 'bc1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3qccfmv3';
const testnetWshAddress = 'tb1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3q0sl5k7';
const regtestWshAddress = 'bcrt1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3qzf4jry';
const testnetTaprootAddress = 'tb1pmfr3p9j00pfxjh0zmgp99y8zftmd3s5pmedqhyptwy6lm87hf5ssk79hv2';
const regtestTaprootAddress = 'bcrt1pmfr3p9j00pfxjh0zmgp99y8zftmd3s5pmedqhyptwy6lm87hf5ssm803es';

describe('isLedgerOnDeviceAddressConfirmed', () => {
  const address = mainnetWshAddress;

  it('confirms when the on-device address equals the expected address', () => {
    expect(isLedgerOnDeviceAddressConfirmed(address, address)).toBe(true);
  });

  it('rejects when the on-device address differs from the expected address', () => {
    expect(
      isLedgerOnDeviceAddressConfirmed('bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq', address)
    ).toBe(false);
  });

  it('rejects when the expected address is null', () => {
    expect(isLedgerOnDeviceAddressConfirmed(address, null)).toBe(false);
  });

  it('rejects when the expected address is undefined', () => {
    expect(isLedgerOnDeviceAddressConfirmed(address, undefined)).toBe(false);
  });

  it('rejects when the expected address is an empty string', () => {
    expect(isLedgerOnDeviceAddressConfirmed(address, '')).toBe(false);
  });

  it('does not confirm two empty addresses', () => {
    expect(isLedgerOnDeviceAddressConfirmed('', '')).toBe(false);
  });

  it('confirms a testnet on-device address against the same script encoded for regtest', () => {
    expect(isLedgerOnDeviceAddressConfirmed(testnetWshAddress, regtestWshAddress)).toBe(true);
    expect(isLedgerOnDeviceAddressConfirmed(testnetTaprootAddress, regtestTaprootAddress)).toBe(
      true
    );
  });

  it('rejects a testnet on-device address against a different regtest script', () => {
    expect(isLedgerOnDeviceAddressConfirmed(testnetTaprootAddress, regtestWshAddress)).toBe(false);
  });

  it('rejects a mainnet on-device address against the same script encoded for regtest', () => {
    expect(isLedgerOnDeviceAddressConfirmed(mainnetWshAddress, regtestWshAddress)).toBe(false);
  });

  it('rejects a testnet on-device address against the same script encoded for mainnet', () => {
    expect(isLedgerOnDeviceAddressConfirmed(testnetWshAddress, mainnetWshAddress)).toBe(false);
  });
});

describe('toLedgerDisplayedAddress', () => {
  it('re-encodes a regtest address with the testnet prefix', () => {
    expect(toLedgerDisplayedAddress(regtestWshAddress)).toBe(testnetWshAddress);
    expect(toLedgerDisplayedAddress(regtestTaprootAddress)).toBe(testnetTaprootAddress);
  });

  it('returns testnet addresses unchanged', () => {
    expect(toLedgerDisplayedAddress(testnetWshAddress)).toBe(testnetWshAddress);
  });

  it('returns mainnet addresses unchanged', () => {
    expect(toLedgerDisplayedAddress(mainnetWshAddress)).toBe(mainnetWshAddress);
  });
});

describe('descriptorHasNonAccountRawKey', () => {
  const accountKeychain = makeNativeSegwitAccountKeychain(1);

  it('returns false for a multisig of only extended keys', () => {
    const compiled = compileWshDescriptor(`wsh(sortedmulti(2,${xpubA}/0/0,${xpubB}/0/0))`);
    const accountKey = findAccountDescriptorKey(compiled, accountKeychain)!;

    expect(descriptorHasNonAccountRawKey(compiled, accountKey.key)).toBe(false);
  });

  it('returns false for a single extended-key descriptor', () => {
    const compiled = compileWshDescriptor(`wsh(pk(${xpubA}/0/0))`);
    const accountKey = findAccountDescriptorKey(compiled, accountKeychain)!;

    expect(descriptorHasNonAccountRawKey(compiled, accountKey.key)).toBe(false);
  });

  it('returns true when a co-signer is supplied as a raw public key', () => {
    const cosignerRawPubkey = makeNativeSegwitAddressPubkey(2);
    const compiled = compileWshDescriptor(
      `wsh(multi(2,${bytesToHex(cosignerRawPubkey)},${xpubA}/0/7))`
    );
    const accountKey = findAccountDescriptorKey(compiled, accountKeychain)!;

    expect(accountKey.key.bip32).toBeDefined();
    expect(descriptorHasNonAccountRawKey(compiled, accountKey.key)).toBe(true);
  });

  it('does not flag the account key itself when it is a raw public key', () => {
    const accountRawPubkey = makeNativeSegwitAddressPubkey(1);
    const compiled = compileWshDescriptor(
      `wsh(multi(2,${bytesToHex(accountRawPubkey)},${xpubB}/0/0))`
    );
    const accountKey = findAccountDescriptorKey(compiled, accountKeychain)!;

    expect(accountKey.key.bip32).toBeUndefined();
    expect(descriptorHasNonAccountRawKey(compiled, accountKey.key)).toBe(false);
  });

  const bondHash = bytesToHex(sha256(new Uint8Array([1, 2, 3])));

  function makeBondDescriptor(counterpartyKey: string) {
    return `wsh(and_v(v:or_i(after(1000),and_v(v:sha256(${bondHash}),pk(${counterpartyKey}))),sortedmulti(2,${xpubA}/0/0,${xpubB}/0/0)))`;
  }

  it('returns true for a bond whose counterparty is a raw public key', () => {
    const rawCounterparty = bytesToHex(makeNativeSegwitAddressPubkey(9));
    const compiled = compileWshDescriptor(makeBondDescriptor(rawCounterparty));
    const accountKey = findAccountDescriptorKey(compiled, accountKeychain)!;

    expect(descriptorHasNonAccountRawKey(compiled, accountKey.key)).toBe(true);
  });

  it('returns false for a bond whose counterparty is an extended key at the vault index', () => {
    const compiled = compileWshDescriptor(
      makeBondDescriptor(`${makeNativeSegwitAccountXpub(9)}/0/0`)
    );
    const accountKey = findAccountDescriptorKey(compiled, accountKeychain)!;

    expect(descriptorHasNonAccountRawKey(compiled, accountKey.key)).toBe(false);
  });
});
