import { bytesToHex } from '@noble/hashes/utils';
import { HDKey } from '@scure/bip32';

export function makeNativeSegwitAccountKeychain(seedByte: number) {
  return HDKey.fromMasterSeed(new Uint8Array(32).fill(seedByte)).derive("m/84'/0'/0'");
}

export function makeNativeSegwitAccountXpub(seedByte: number) {
  return makeNativeSegwitAccountKeychain(seedByte).publicExtendedKey;
}

export function makeNativeSegwitAddressPubkey(seedByte: number, addressIndex = 0): Uint8Array {
  const { publicKey } = makeNativeSegwitAccountKeychain(seedByte)
    .deriveChild(0)
    .deriveChild(addressIndex);
  if (!publicKey) throw new Error('Expected public key bytes to be defined');
  return publicKey;
}

export function makeNativeSegwitAddressPubkeyHex(seedByte: number, addressIndex = 0): string {
  return bytesToHex(makeNativeSegwitAddressPubkey(seedByte, addressIndex));
}
