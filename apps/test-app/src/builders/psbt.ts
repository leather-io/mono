// The PSBT lab: one parametric builder instead of one button per combination.
//
// A scenario names its inputs by KIND (which key locks them and with which
// sighash flag) and its outputs by ROLE (back to the wallet, to a stranger, an
// OP_RETURN). Everything key-shaped is resolved from the CONNECTED wallet, so
// the same scenario runs on any Leather install.
//
// Inputs spend FICTITIOUS outpoints by default: signing is offline, so the
// wallet signs happily and only a broadcast would fail. `utxo/esplora.ts`
// swaps in real outpoints when a node is configured.
//
// Pure: no React, no `window`.
import { hex } from '@scure/base';
import { HDKey } from '@scure/bip32';
import * as btc from '@scure/btc-signer';

import { compileDescriptor } from './descriptors';

/** Obviously fake outpoint — never exists on any chain. */
const fakeTxid = '42'.repeat(32);
const defaultInputValue = 100_000n;
const defaultFee = 1_000n;

// A key the connected wallet provably does not hold, for inputs and outputs
// that must NOT be signable. Derived from the all-0x11 co-signer seed.
const foreignPublicKey = '03519a011b2544949be153baa0c204ad2140d8779fc53ec6085101b62464165e6d';

export type PsbtInputKind = 'p2wpkh' | 'p2tr' | 'wsh-pk' | 'sortedmulti' | 'foreign';
export type PsbtOutputKind = 'self' | 'foreign' | 'op-return';

export interface PsbtInputConfig {
  kind: PsbtInputKind;
  /** PSBT_IN_SIGHASH_TYPE for this input; omit to leave the field absent. */
  sighash?: number;
  /** Repeat this input configuration N times. Default 1. */
  count?: number;
  /** Value of the fake previous output. */
  amount?: bigint;
}

export interface PsbtOutputConfig {
  kind: PsbtOutputKind;
  /** Explicit amount; the last output without one absorbs the remainder. */
  amount?: bigint;
  /** `op-return` only: payload bytes as hex. */
  data?: string;
}

export interface PsbtScenarioConfig {
  inputs: PsbtInputConfig[];
  outputs?: PsbtOutputConfig[];
  fee?: bigint;
}

/** Everything a scenario can need from the wallet, fetched once. */
export interface PsbtKeys {
  /** 33-byte compressed native-segwit key. */
  nativeSegwitPubkey?: Uint8Array;
  /** 32-byte x-only internal + tweaked taproot keys. */
  taprootInternalKey?: Uint8Array;
  taprootTweakedKey?: Uint8Array;
  /** `wsh(sortedmulti(...))` the wallet is a signer of. */
  vaultDescriptor?: string;
  /** Account xpub + index behind `vaultDescriptor`, to name the own key. */
  ownXpub?: string;
  vaultAccountIndex?: number;
}

export interface LockingScript {
  /** scriptPubKey of the output being spent. */
  script: Uint8Array;
  /** Witness script for P2WSH outputs. */
  witnessScript?: Uint8Array;
  /** x-only internal key for taproot key-path inputs. */
  tapInternalKey?: Uint8Array;
  /** Descriptor the wallet needs to recognise a custom script. */
  descriptor?: string;
  /** Key expected to produce the signature, hex (x-only for taproot). */
  expectedSigner?: string;
}

/** Plain native-segwit output owned by `pubkey`. */
export function p2wpkhScript(pubkey: Uint8Array): LockingScript {
  return { script: btc.p2wpkh(pubkey).script, expectedSigner: hex.encode(pubkey) };
}

/** Taproot key-path output; the signature verifies against the TWEAKED key. */
export function p2trScript(internalKey: Uint8Array, tweakedKey?: Uint8Array): LockingScript {
  const payment = btc.p2tr(internalKey);
  return {
    script: payment.script,
    tapInternalKey: internalKey,
    expectedSigner: hex.encode(tweakedKey ?? payment.tweakedPubkey),
  };
}

/**
 * The simplest custom P2WSH miniscript around one key: `wsh(pk(K))`, witness
 * script `<K> OP_CHECKSIG`. Used to exercise `signPsbt` + `descriptor`.
 */
export function wshPkScript(pubkey: Uint8Array): LockingScript {
  const out = btc.p2wsh(btc.p2pk(pubkey));
  return {
    script: out.script,
    witnessScript: out.witnessScript,
    descriptor: `wsh(pk(${hex.encode(pubkey)}))`,
    expectedSigner: hex.encode(pubkey),
  };
}

/** Locking script of any `wsh(...)` descriptor, compiled as the wallet does. */
export function descriptorScript(descriptor: string, expectedSigner?: string): LockingScript {
  const { script, witnessScript } = compileDescriptor(descriptor);
  return { script, witnessScript, descriptor, expectedSigner };
}

/** An output the connected wallet cannot sign for. */
export function foreignScript(): LockingScript {
  return { script: btc.p2wpkh(hex.decode(foreignPublicKey)).script };
}

/** The child key of an account xpub at `0/index` — the wallet's vault key. */
export function deriveVaultKey(xpub: string, accountIndex = 0): Uint8Array {
  const child = HDKey.fromExtendedKey(xpub).deriveChild(0).deriveChild(accountIndex);
  if (!child.publicKey) throw new Error(`Cannot derive a public key from ${xpub}`);
  return child.publicKey;
}

function lockingScriptFor(kind: PsbtInputKind, keys: PsbtKeys): LockingScript {
  switch (kind) {
    case 'p2wpkh': {
      if (!keys.nativeSegwitPubkey) throw new Error('Scenario needs the native-segwit key');
      return p2wpkhScript(keys.nativeSegwitPubkey);
    }
    case 'p2tr': {
      if (!keys.taprootInternalKey) throw new Error('Scenario needs the taproot key');
      return p2trScript(keys.taprootInternalKey, keys.taprootTweakedKey);
    }
    case 'wsh-pk': {
      if (!keys.nativeSegwitPubkey) throw new Error('Scenario needs the native-segwit key');
      return wshPkScript(keys.nativeSegwitPubkey);
    }
    case 'sortedmulti': {
      if (!keys.vaultDescriptor) throw new Error('Scenario needs a vault descriptor');
      const signer = keys.ownXpub
        ? hex.encode(deriveVaultKey(keys.ownXpub, keys.vaultAccountIndex ?? 0))
        : undefined;
      return descriptorScript(keys.vaultDescriptor, signer);
    }
    case 'foreign':
    default:
      return foreignScript();
  }
}

export interface PsbtScenarioInput {
  index: number;
  kind: PsbtInputKind;
  sighash?: number;
  amount: bigint;
  /** Key that should sign this input, hex; absent for foreign inputs. */
  expectedSigner?: string;
}

export interface PsbtScenario {
  psbtHex: string;
  inputs: PsbtScenarioInput[];
  /** Descriptor to send alongside, when any input needs one. */
  descriptor?: string;
  totalInput: bigint;
  fee: bigint;
}

/**
 * Build the unsigned PSBT a scenario describes. Deterministic: the same config
 * and keys always produce the same hex, so a Playwright run and a click send
 * byte-identical requests.
 */
export function buildPsbtScenario(config: PsbtScenarioConfig, keys: PsbtKeys): PsbtScenario {
  const fee = config.fee ?? defaultFee;
  const tx = new btc.Transaction({ allowUnknownInputs: true, allowUnknownOutputs: true });

  const expanded = config.inputs.flatMap(input =>
    Array.from({ length: input.count ?? 1 }, () => input)
  );
  if (!expanded.length) throw new Error('A PSBT scenario needs at least one input');

  const scenarioInputs: PsbtScenarioInput[] = [];
  let descriptor: string | undefined;
  let totalInput = 0n;

  expanded.forEach((input, index) => {
    const lock = lockingScriptFor(input.kind, keys);
    const amount = input.amount ?? defaultInputValue;
    if (lock.descriptor) descriptor = lock.descriptor;
    totalInput += amount;
    tx.addInput({
      txid: hex.decode(fakeTxid),
      index,
      witnessUtxo: { script: lock.script, amount },
      ...(lock.witnessScript ? { witnessScript: lock.witnessScript } : {}),
      ...(lock.tapInternalKey ? { tapInternalKey: lock.tapInternalKey } : {}),
      ...(input.sighash !== undefined ? { sighashType: input.sighash } : {}),
    });
    scenarioInputs.push({
      index,
      kind: input.kind,
      sighash: input.sighash,
      amount,
      expectedSigner: lock.expectedSigner,
    });
  });

  // Default: everything back where it came from, minus the fee.
  const outputs = config.outputs?.length ? config.outputs : [{ kind: 'self' as const }];
  const fixed = outputs.reduce((sum, output) => sum + (output.amount ?? 0n), 0n);
  const unpriced = outputs.filter(
    output => output.kind !== 'op-return' && output.amount === undefined
  );
  const remainder = totalInput - fee - fixed;
  if (unpriced.length && remainder <= 0n)
    throw new Error('Scenario outputs and fee exceed the inputs');
  const perUnpriced = unpriced.length ? remainder / BigInt(unpriced.length) : 0n;

  const selfScript = lockingScriptFor(expanded[0].kind, keys).script;
  let unpricedSeen = 0;
  outputs.forEach(output => {
    if (output.kind === 'op-return') {
      const data = hex.decode(output.data ?? hex.encode(new TextEncoder().encode('leather-test')));
      tx.addOutput({ script: btc.Script.encode(['RETURN', data]), amount: output.amount ?? 0n });
      return;
    }
    const script = output.kind === 'foreign' ? foreignScript().script : selfScript;
    if (output.amount !== undefined) {
      tx.addOutput({ script, amount: output.amount });
      return;
    }
    unpricedSeen += 1;
    // The last unpriced output absorbs the rounding remainder.
    const amount =
      unpricedSeen === unpriced.length
        ? remainder - perUnpriced * BigInt(unpriced.length - 1)
        : perUnpriced;
    tx.addOutput({ script, amount });
  });

  return { psbtHex: hex.encode(tx.toPSBT()), inputs: scenarioInputs, descriptor, totalInput, fee };
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
      witnessUtxo: { script: lock.script, amount: defaultInputValue },
      ...(lock.witnessScript ? { witnessScript: lock.witnessScript } : {}),
      ...(lock.tapInternalKey ? { tapInternalKey: lock.tapInternalKey } : {}),
      ...(options.sighashType !== undefined ? { sighashType: options.sighashType } : {}),
    });
  }
  tx.addOutput({
    script: lock.script,
    amount: defaultInputValue * BigInt(inputs) - defaultFee,
  });
  return hex.encode(tx.toPSBT());
}
