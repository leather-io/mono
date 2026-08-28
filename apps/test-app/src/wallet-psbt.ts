// PSBTs built from the CONNECTED wallet's own keys, so every signPsbt button
// works on any Leather install — nothing here is tied to a particular seed.
//
// Flow: `getAddresses` → take the account's native-segwit key (or a policy
// account's descriptor) → compile the locking script with @scure/btc-signer →
// PSBT spending a FICTITIOUS outpoint at that script back to itself. Signing
// is offline, so the wallet signs happily; only a broadcast would fail.
//
// Pure: no React, no `window`. Wallet access comes through `RequestContext`,
// so Playwright specs can drive these builders with `page.evaluate`.
import { hex } from '@scure/base';
import * as btc from '@scure/btc-signer';

import { BTC_COSIGNER_PUBLIC_KEYS, MULTISIG_THRESHOLD } from './constants';

/** Obviously fake outpoint — never exists on any chain. */
const fakeTxid = '42'.repeat(32);
const fakeInputValue = 100_000n;
const fakeFee = 1_000n;

export interface LockingScript {
  /** scriptPubKey of the output being spent. */
  script: Uint8Array;
  /** Witness script for P2WSH outputs. */
  witnessScript?: Uint8Array;
}

/** Plain native-segwit output owned by `pubkey`. */
export function p2wpkhScript(pubkey: Uint8Array): LockingScript {
  return { script: btc.p2wpkh(pubkey).script };
}

/**
 * The simplest custom P2WSH miniscript around one key: `wsh(pk(K))`, witness
 * script `<K> OP_CHECKSIG`. Used to exercise `signPsbt` + `descriptor`.
 */
export function wshPkScript(pubkey: Uint8Array): LockingScript & { descriptor: string } {
  const out = btc.p2wsh(btc.p2pk(pubkey));
  return {
    script: out.script,
    witnessScript: out.witnessScript,
    descriptor: `wsh(pk(${hex.encode(pubkey)}))`,
  };
}

/**
 * A 2-of-N `wsh(sortedmulti(…))` descriptor in which the CONNECTED wallet owns
 * one key (`ownPubkey`, its native-segwit key) next to the co-signers from
 * BTC_COSIGNER_PUBLIC_KEYS. Registered through `btc_addAccount` it becomes a
 * policy account the wallet can spend from; sent with a PSBT to `signPsbt` it
 * exercises the co-sign path: the wallet adds its partial signature.
 */
export function sortedMultiCosignDescriptor(ownPubkey: Uint8Array): string {
  const keys = [hex.encode(ownPubkey), ...BTC_COSIGNER_PUBLIC_KEYS];
  return `wsh(sortedmulti(${MULTISIG_THRESHOLD},${keys.join(',')}))`;
}

const sortedMultiPattern = /^wsh\(sortedmulti\((\d+),([0-9a-fA-F,]+)\)\)(#[a-z0-9]{8})?$/;

/**
 * Compile a policy-account descriptor `wsh(sortedmulti(k,pubkey…))[#checksum]`
 * — the form `getAddresses` reports for p2wsh accounts — into its locking
 * script. Keys are BIP-67 sorted, matching how the wallet derives the address.
 */
export function sortedMultiScript(descriptor: string): LockingScript {
  const match = sortedMultiPattern.exec(descriptor.trim());
  if (!match)
    throw new Error(
      `Only wsh(sortedmulti(k,pubkeys…)) descriptors are supported here, got: ${descriptor}`
    );
  const threshold = Number(match[1]);
  const keys = match[2]
    .split(',')
    .map(key => key.toLowerCase())
    .sort()
    .map(key => hex.decode(key));
  const out = btc.p2wsh(btc.p2ms(threshold, keys));
  return { script: out.script, witnessScript: out.witnessScript };
}

export interface SelfSpendOptions {
  /** Number of (fake) inputs at the same script. Default 1. */
  inputs?: number;
  /** PSBT_IN_SIGHASH_TYPE for every input; omit for the default (ALL). */
  sighashType?: number;
}

/**
 * Unsigned PSBT spending `inputs` fictitious outpoints locked by `lock` back to
 * the same script, minus a fee. Deterministic for a given lock + options.
 */
export function buildSelfSpendPsbtHex(lock: LockingScript, options: SelfSpendOptions = {}): string {
  const inputs = options.inputs ?? 1;
  const tx = new btc.Transaction({ allowUnknownInputs: true, allowUnknownOutputs: true });
  for (let index = 0; index < inputs; index += 1) {
    tx.addInput({
      txid: hex.decode(fakeTxid),
      index,
      witnessUtxo: { script: lock.script, amount: fakeInputValue },
      witnessScript: lock.witnessScript,
      sighashType: options.sighashType,
    });
  }
  tx.addOutput({ script: lock.script, amount: fakeInputValue * BigInt(inputs) - fakeFee });
  return hex.encode(tx.toPSBT());
}
