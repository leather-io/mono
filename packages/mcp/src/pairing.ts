import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

import { addressResponseBodySchema } from '@leather.io/rpc';

import { McpToolError } from './errors';

const pairedAccountSchema = z.object({
  id: z.object({ fingerprint: z.string(), accountIndex: z.number() }),
  bitcoin: z
    .object({
      type: z.literal('hd'),
      nativeSegwitDescriptor: z.string(),
      taprootDescriptor: z.string(),
      zeroIndexNativeSegwitPayerAddress: z.string().optional(),
      zeroIndexTaprootPayerAddress: z.string().optional(),
    })
    .optional(),
  stacks: z.object({ stxAddress: z.string() }).optional(),
});

const pairingSchema = z.object({
  pairedAt: z.string(),
  account: pairedAccountSchema,
});

type Pairing = z.infer<typeof pairingSchema>;

export class PairingStore {
  private readonly filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  load(): Pairing | null {
    try {
      const raw = readFileSync(this.filePath, 'utf8');
      const parsed = pairingSchema.safeParse(JSON.parse(raw));
      return parsed.success ? parsed.data : null;
    } catch {
      return null;
    }
  }

  save(pairing: Pairing) {
    mkdirSync(path.dirname(this.filePath), { recursive: true });
    writeFileSync(this.filePath, JSON.stringify(pairing, null, 2), 'utf8');
  }

  clear() {
    try {
      rmSync(this.filePath);
    } catch {
      return;
    }
  }
}

function parseAccountIndexFromDerivationPath(derivationPath: string): number {
  const segments = derivationPath.replace(/^m\//, '').split('/');
  const accountSegment = segments[2];
  if (!accountSegment) throw new McpToolError('INVALID_PARAMS', 'Unrecognized derivation path');
  const accountIndex = Number.parseInt(accountSegment.replace(/['h]$/, ''), 10);
  if (Number.isNaN(accountIndex))
    throw new McpToolError('INVALID_PARAMS', 'Unrecognized derivation path');
  return accountIndex;
}

export function mapAddressesResultToPairing(payload: unknown): Pairing {
  const parsed = addressResponseBodySchema.safeParse(payload);
  if (!parsed.success)
    throw new McpToolError('INVALID_PARAMS', 'Wallet returned an unrecognized addresses payload');

  const addresses = parsed.data.addresses;
  const nativeSegwit = addresses.find(entry => entry.symbol === 'BTC' && entry.type === 'p2wpkh');
  const taproot = addresses.find(entry => entry.symbol === 'BTC' && entry.type === 'p2tr');
  const stacks = addresses.find(entry => entry.symbol === 'STX' && entry.kind === 'single-sig');

  if (!stacks && (!nativeSegwit || !taproot))
    throw new McpToolError('INVALID_PARAMS', 'Wallet returned no usable single-sig addresses');

  const hasBitcoin =
    nativeSegwit &&
    taproot &&
    nativeSegwit.symbol === 'BTC' &&
    nativeSegwit.type === 'p2wpkh' &&
    taproot.symbol === 'BTC' &&
    taproot.type === 'p2tr';

  const fingerprint = hasBitcoin ? nativeSegwit.fingerprint : 'unknown';
  const accountIndex = hasBitcoin
    ? parseAccountIndexFromDerivationPath(nativeSegwit.derivationPath)
    : 0;

  return {
    pairedAt: new Date().toISOString(),
    account: {
      id: { fingerprint, accountIndex },
      bitcoin: hasBitcoin
        ? {
            type: 'hd',
            nativeSegwitDescriptor: nativeSegwit.descriptor,
            taprootDescriptor: taproot.descriptor,
            zeroIndexNativeSegwitPayerAddress: nativeSegwit.address,
            zeroIndexTaprootPayerAddress: taproot.address,
          }
        : undefined,
      stacks:
        stacks && stacks.symbol === 'STX' && stacks.kind === 'single-sig'
          ? { stxAddress: stacks.address }
          : undefined,
    },
  };
}
