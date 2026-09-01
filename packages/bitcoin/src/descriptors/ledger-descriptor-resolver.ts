import { type KeyInfo } from '@bitcoinerlab/descriptors';
import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex } from '@noble/hashes/utils';
import { createBase58check } from '@scure/base';
import { Psbt } from 'bitcoinjs-lib';

import { deriveKeychainFromXpub } from '@leather.io/crypto';

import {
  type AccountDescriptorKey,
  type CompiledWshDescriptor,
  compileWshDescriptor,
  stripDescriptorChecksum,
} from './wsh-descriptor';

const base58check = createBase58check(sha256);

type GlobalXpub = NonNullable<Psbt['data']['globalMap']['globalXpub']>[number];
type Bip32Derivation = NonNullable<Psbt['data']['inputs'][number]['bip32Derivation']>[number];
type RawPublicKey = KeyInfo & { pubkey: Uint8Array };

export interface ResolveLedgerSignableDescriptorArgs {
  descriptor: string;
  psbt: Uint8Array;
  inputIndexes: number[];
  accountKey: AccountDescriptorKey['key'];
}

function getForeignRawPublicKeys(keys: KeyInfo[], accountKey: RawPublicKey): RawPublicKey[] {
  const accountPublicKey = bytesToHex(accountKey.pubkey);
  return keys.filter(
    (key): key is RawPublicKey =>
      !key.bip32 && !!key.pubkey && bytesToHex(key.pubkey) !== accountPublicKey
  );
}

function resolveKeyExpression(
  globalXpub: GlobalXpub,
  derivation: Bip32Derivation,
  publicKey: string
): string | null {
  if (!derivation.path.startsWith(`${globalXpub.path}/`)) return null;
  const keyPath = derivation.path.slice(globalXpub.path.length);
  try {
    const xpub = base58check.encode(globalXpub.extendedPubkey);
    const derivedKeychain = deriveKeychainFromXpub(xpub).derive(`m${keyPath}`);
    if (!derivedKeychain.publicKey || bytesToHex(derivedKeychain.publicKey) !== publicKey)
      return null;
    return xpub + keyPath;
  } catch {
    return null;
  }
}

function compilesToSameScripts(descriptor: string, compiled: CompiledWshDescriptor): boolean {
  try {
    const resolved = compileWshDescriptor(descriptor);
    return (
      bytesToHex(resolved.scriptPubKey) === bytesToHex(compiled.scriptPubKey) &&
      bytesToHex(resolved.witnessScript) === bytesToHex(compiled.witnessScript)
    );
  } catch {
    return false;
  }
}

export function resolveLedgerSignableDescriptor({
  descriptor,
  psbt: rawPsbt,
  inputIndexes,
  accountKey,
}: ResolveLedgerSignableDescriptorArgs): string | null {
  const compiled = compileWshDescriptor(descriptor);
  const foreignKeys = getForeignRawPublicKeys(compiled.keys, accountKey);
  if (!foreignKeys.length) return descriptor;

  const psbt = Psbt.fromBuffer(rawPsbt);
  const globalXpubs = psbt.data.globalMap.globalXpub ?? [];
  const derivations = inputIndexes.flatMap(index => psbt.data.inputs[index]?.bip32Derivation ?? []);

  const resolvedDescriptor = foreignKeys.reduce<string | null>((current, rawKey) => {
    if (current === null) return null;
    const publicKey = bytesToHex(rawKey.pubkey);
    const keyExpression = derivations
      .filter(derivation => bytesToHex(derivation.pubkey) === publicKey)
      .flatMap(derivation =>
        globalXpubs.flatMap(
          globalXpub => resolveKeyExpression(globalXpub, derivation, publicKey) ?? []
        )
      )
      .at(0);
    return keyExpression ? current.replaceAll(rawKey.keyExpression, keyExpression) : null;
  }, stripDescriptorChecksum(descriptor));

  if (!resolvedDescriptor || !compilesToSameScripts(resolvedDescriptor, compiled)) return null;
  return resolvedDescriptor;
}
