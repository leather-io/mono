import { z } from 'zod';

import { type Address, addressSchema } from '@leather.io/rpc';

interface GenericWalletAddress {
  symbol: 'BTC' | 'STX';
  address: string;
  publicKey?: string;
  type?: 'p2wpkh' | 'p2tr';
}

export type WalletAddressEntry = Address | GenericWalletAddress;

const genericAddressSourceSchema = z.object({
  address: z.string().min(1),
  publicKey: z.string().optional(),
  type: z.string().optional(),
  addressType: z.string().optional(),
});

type GenericAddressSource = z.infer<typeof genericAddressSourceSchema>;

const stacksAddressPattern = /^S[PMTN]/;
const taprootAddressPattern = /^(bc1p|tb1p|bcrt1p)/;
const nativeSegwitAddressPattern = /^(bc1q|tb1q|bcrt1q)/;

function deriveBitcoinAddressType(source: GenericAddressSource): 'p2wpkh' | 'p2tr' | undefined {
  if (source.type === 'p2tr' || source.addressType === 'p2tr') return 'p2tr';
  if (source.type === 'p2wpkh' || source.addressType === 'p2wpkh') return 'p2wpkh';
  const address = source.address.toLowerCase();
  if (taprootAddressPattern.test(address)) return 'p2tr';
  if (nativeSegwitAddressPattern.test(address)) return 'p2wpkh';
  return undefined;
}

export function normalizeWalletAddresses(entries: unknown[]): WalletAddressEntry[] {
  return entries.flatMap((entry): WalletAddressEntry[] => {
    const leatherEntry = addressSchema.safeParse(entry);
    if (leatherEntry.success) return [leatherEntry.data];

    const genericEntry = genericAddressSourceSchema.safeParse(entry);
    if (!genericEntry.success) return [];

    const source = genericEntry.data;
    if (stacksAddressPattern.test(source.address)) {
      return [{ symbol: 'STX', address: source.address, publicKey: source.publicKey }];
    }
    return [
      {
        symbol: 'BTC',
        address: source.address,
        publicKey: source.publicKey,
        type: deriveBitcoinAddressType(source),
      },
    ];
  });
}
