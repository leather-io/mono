import { z } from 'zod';

import {
  type BitcoinAddressType,
  bitcoinAddressTypes,
  getBitcoinAddressType,
} from '@leather.io/bitcoin';
import { type Address, addressSchema } from '@leather.io/rpc';
import { isValidStacksAddress } from '@leather.io/stacks';

interface GenericWalletAddress {
  symbol: 'BTC' | 'STX';
  address: string;
  publicKey?: string;
  type?: BitcoinAddressType;
}

export type WalletAddressEntry = Address | GenericWalletAddress;

const genericAddressSourceSchema = z.object({
  address: z.string().min(1),
  publicKey: z.string().nullish(),
  type: z.string().optional(),
  addressType: z.string().optional(),
});

type GenericAddressSource = z.infer<typeof genericAddressSourceSchema>;

function toBitcoinAddressType(value: string | undefined): BitcoinAddressType | undefined {
  return bitcoinAddressTypes.find(type => type === value);
}

function deriveBitcoinAddressType(source: GenericAddressSource): BitcoinAddressType | undefined {
  const explicitType =
    toBitcoinAddressType(source.type) ?? toBitcoinAddressType(source.addressType);
  if (explicitType) return explicitType;
  return getBitcoinAddressType(source.address);
}

export function normalizeWalletAddresses(entries: unknown[]): WalletAddressEntry[] {
  return entries.flatMap((entry): WalletAddressEntry[] => {
    const leatherEntry = addressSchema.safeParse(entry);
    if (leatherEntry.success) return [leatherEntry.data];

    const genericEntry = genericAddressSourceSchema.safeParse(entry);
    if (!genericEntry.success) return [];

    const source = genericEntry.data;
    if (isValidStacksAddress(source.address)) {
      return [{ symbol: 'STX', address: source.address, publicKey: source.publicKey ?? undefined }];
    }

    const type = deriveBitcoinAddressType(source);
    if (!type) return [];
    return [
      {
        symbol: 'BTC',
        address: source.address,
        publicKey: source.publicKey ?? undefined,
        type,
      },
    ];
  });
}
