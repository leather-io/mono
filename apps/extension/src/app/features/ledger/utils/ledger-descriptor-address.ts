import { type CompiledWshDescriptor, reencodeTestnetFamilyAddress } from '@leather.io/bitcoin';

type WshDescriptorKey = CompiledWshDescriptor['keys'][number];

export function toLedgerDisplayedAddress(address: string): string {
  return reencodeTestnetFamilyAddress(address, 'testnet') ?? address;
}

export function isLedgerOnDeviceAddressConfirmed(
  onDeviceAddress: string,
  expectedAddress: string | null | undefined
): boolean {
  if (!expectedAddress) return false;
  return toLedgerDisplayedAddress(onDeviceAddress) === toLedgerDisplayedAddress(expectedAddress);
}

export function descriptorHasNonAccountRawKey(
  compiled: CompiledWshDescriptor,
  accountKey: WshDescriptorKey
): boolean {
  return compiled.keys.some(key => key !== accountKey && !key.bip32);
}

export const ledgerRawKeyUnsupportedMessage =
  "Ledger can't display this address because another key in the descriptor is a raw public key. Ask the requesting site to provide every key as an extended public key (xpub), or verify with a software wallet.";
