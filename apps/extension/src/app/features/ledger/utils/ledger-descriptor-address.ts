import type { CompiledWshDescriptor } from '@leather.io/bitcoin';

type WshDescriptorKey = CompiledWshDescriptor['keys'][number];

export function isLedgerOnDeviceAddressConfirmed(
  onDeviceAddress: string,
  expectedAddress: string | null | undefined
): boolean {
  return !!expectedAddress && onDeviceAddress === expectedAddress;
}

export function descriptorHasNonAccountRawKey(
  compiled: CompiledWshDescriptor,
  accountKey: WshDescriptorKey
): boolean {
  return compiled.keys.some(key => key !== accountKey && !key.bip32);
}
