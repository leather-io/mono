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
