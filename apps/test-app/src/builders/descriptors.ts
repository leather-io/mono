// Descriptors in the shapes production actually sends.
//
// The multisig dApp builds `wsh(sortedmulti(k, <xpub>/0/<accountIndex>, …))`
// from EXTENDED keys (see its getMultisigDescriptor) — never raw public keys.
// That matters beyond cosmetics: bond vaults reject non-extended keys, Ledger
// policy registration derives its wallet policy from the key origins, and the
// wallet matches its own key by xpub. So the catalog builds the same shape,
// with the connected wallet's own xpub in it.
//
// Pure: no React, no `window`.
import { sha256 } from '@noble/hashes/sha256';
import { hex } from '@scure/base';

import {
  compileWshDescriptor,
  getBondVaultKeys,
  instantiateBondDescriptor,
} from '@leather.io/bitcoin';

import {
  BOND_COUNTERPARTY_PUBLIC_KEY,
  BOND_PREIMAGE,
  BOND_UNLOCK_HEIGHT,
  BTC_COSIGNER_PUBLIC_KEYS,
  BTC_COSIGNER_TPUBS,
  BTC_COSIGNER_XPUBS,
  MULTISIG_THRESHOLD,
} from '../constants';
import type { NetworkMode } from '../types';

/** Co-signer keys matching the run's network — a descriptor can't mix flavours. */
export function cosignerXpubsFor(mode: NetworkMode): string[] {
  return mode === 'mainnet' ? BTC_COSIGNER_XPUBS : BTC_COSIGNER_TPUBS;
}

export interface SortedMultiDescriptorArgs {
  /** The connected wallet's account-level xpub, from `fetchAccountKeys`. */
  ownXpub: string;
  cosignerXpubs: string[];
  threshold?: number;
  /** Vault account index; the key path is `/0/<accountIndex>`. */
  accountIndex?: number;
}

/**
 * `wsh(sortedmulti(k, xpub/0/i, …))` with the connected wallet first. Key
 * ORDER in the string does not change the address — sortedmulti sorts the
 * derived keys — but it does decide which slot the wallet reads as its own.
 */
export function sortedMultiDescriptor({
  ownXpub,
  cosignerXpubs,
  threshold = MULTISIG_THRESHOLD,
  accountIndex = 0,
}: SortedMultiDescriptorArgs): string {
  const keys = [ownXpub, ...cosignerXpubs].map(xpub => `${xpub}/0/${accountIndex}`);
  if (threshold > keys.length)
    throw new Error(`Threshold ${threshold} exceeds the ${keys.length} keys available`);
  return `wsh(sortedmulti(${threshold},${keys.join(',')}))`;
}

/**
 * The pre-xpub shape: `wsh(sortedmulti(k, <33-byte pubkey>, …))`. No dApp
 * sends this any more; the catalog keeps one button on it because the wallet
 * still accepts it and the raw-pubkey path has its own signing branch.
 */
export function legacyRawPubkeyDescriptor(
  ownPubkey: Uint8Array,
  threshold = MULTISIG_THRESHOLD
): string {
  const keys = [hex.encode(ownPubkey), ...BTC_COSIGNER_PUBLIC_KEYS];
  return `wsh(sortedmulti(${threshold},${keys.join(',')}))`;
}

export interface BondDescriptorArgs {
  /** The vault the bond locks funds from — a sortedmulti of extended keys. */
  vaultDescriptor: string;
  unlockHeight?: number;
  /** 32-byte sha256 digest, hex. Defaults to sha256(BOND_PREIMAGE). */
  hash?: string;
  counterpartyKey?: string;
}

/**
 * The bond-exit template instantiated around a vault: spendable either after
 * `unlockHeight` by the vault, or immediately by the vault plus a counterparty
 * signature and the sha256 preimage. `signPsbt` with a Bitcoin policy account
 * selected accepts ONLY descriptors matching this template.
 */
export function bondDescriptorFor({
  vaultDescriptor,
  unlockHeight = BOND_UNLOCK_HEIGHT,
  hash = bondHash(),
  counterpartyKey = BOND_COUNTERPARTY_PUBLIC_KEY,
}: BondDescriptorArgs): string {
  const { threshold, keyExpressions } = getBondVaultKeys(vaultDescriptor);
  return instantiateBondDescriptor({
    unlockHeight,
    hash,
    counterpartyKey,
    threshold,
    keyExpressions,
  });
}

/** sha256 of the configured preimage — the digest the hashlock branch commits to. */
export function bondHash(preimage = BOND_PREIMAGE): string {
  return hex.encode(sha256(hex.decode(preimage)));
}

export interface CompiledDescriptor {
  script: Uint8Array;
  witnessScript: Uint8Array;
}

/**
 * Compile any `wsh(...)` descriptor to its scriptPubKey and witness script
 * with the same code the wallet derives its address from, so a PSBT built here
 * is locked by exactly what the wallet expects.
 */
export function compileDescriptor(descriptor: string): CompiledDescriptor {
  const { scriptPubKey, witnessScript } = compileWshDescriptor(descriptor);
  return { script: scriptPubKey, witnessScript };
}
