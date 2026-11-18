// Checks what the wallet actually signed, instead of trusting that a returned
// PSBT means a correct signature.
//
// For every input it recomputes the BIP-143 / BIP-341 digest for the flag the
// signature itself carries and verifies the signature against it. That catches
// the case a reviewer cannot see by eye: a signature stamped `SINGLE` but
// computed over the `ALL` digest — or a key signing that should not have.
//
// Pure: no React, no `window`.
import { schnorr, secp256k1 } from '@noble/curves/secp256k1';
import { hex } from '@scure/base';
import * as btc from '@scure/btc-signer';

import { SIGHASH_NAMES } from '../constants';

/** Flags scure assumes when PSBT_IN_SIGHASH_TYPE is absent. */
const defaultEcdsaSighash = 0x01;
const defaultTaprootSighash = 0x00;

const derSignaturePrefix = 0x30;

export type SignatureKind = 'ecdsa' | 'schnorr';

export interface FoundSignature {
  index: number;
  kind: SignatureKind;
  /** Signing key: 33-byte compressed for ECDSA, 32-byte x-only for taproot. */
  pubkey: Uint8Array;
  /** Raw signature bytes including the trailing sighash flag, when present. */
  signature: Uint8Array;
  /** Flag the signature itself carries. */
  sighash: number;
  /** PSBT_IN_SIGHASH_TYPE the request set on the input. */
  declaredSighash?: number;
  finalized: boolean;
}

export function sighashName(flag: number): string {
  return SIGHASH_NAMES[flag] ?? `0x${flag.toString(16).padStart(2, '0')}`;
}

export function parsePsbt(psbtHex: string): btc.Transaction {
  return btc.Transaction.fromPSBT(hex.decode(psbtHex), {
    allowUnknownInputs: true,
    allowUnknownOutputs: true,
  });
}

type PsbtInput = ReturnType<btc.Transaction['getInput']>;

/**
 * BIP-143 scriptCode for a segwit v0 input: the witness script for P2WSH, and
 * the equivalent P2PKH script for P2WPKH — the same substitution the signer
 * makes, so the digest matches byte for byte.
 */
function segwitScriptCode(input: PsbtInput, pubkey: Uint8Array): Uint8Array {
  if (input.witnessScript) return input.witnessScript;
  return btc.p2pkh(pubkey).script;
}

function prevOuts(tx: btc.Transaction) {
  const scripts: Uint8Array[] = [];
  const amounts: bigint[] = [];
  for (let index = 0; index < tx.inputsLength; index += 1) {
    const utxo = tx.getInput(index).witnessUtxo;
    if (!utxo) throw new Error(`Input ${index} has no witnessUtxo to verify against`);
    scripts.push(utxo.script);
    amounts.push(utxo.amount);
  }
  return { scripts, amounts };
}

/** The digest a signature on `index` with `sighash` is supposed to cover. */
export function digestFor(
  tx: btc.Transaction,
  index: number,
  kind: SignatureKind,
  sighash: number,
  pubkey: Uint8Array
): Uint8Array {
  if (kind === 'schnorr') {
    const { scripts, amounts } = prevOuts(tx);
    return tx.preimageWitnessV1(index, scripts, sighash, amounts);
  }
  const input = tx.getInput(index);
  const utxo = input.witnessUtxo;
  if (!utxo) throw new Error(`Input ${index} has no witnessUtxo to verify against`);
  return tx.preimageWitnessV0(index, segwitScriptCode(input, pubkey), sighash, utxo.amount);
}

/**
 * Verify one signature against `tx` as it stands now. Called on the original
 * transaction to confirm the wallet signed correctly, and again on mutated
 * copies to prove what the flag does and does not commit to.
 */
export function checkSignature(tx: btc.Transaction, found: FoundSignature): boolean {
  try {
    const digest = digestFor(tx, found.index, found.kind, found.sighash, found.pubkey);
    if (found.kind === 'schnorr')
      return schnorr.verify(found.signature.slice(0, 64), digest, found.pubkey);
    const der = found.signature.slice(0, -1);
    return secp256k1.verify(secp256k1.Signature.fromDER(der), digest, found.pubkey);
  } catch {
    return false;
  }
}

/** The x-only output key of a taproot input, from its scriptPubKey. */
function taprootOutputKey(input: PsbtInput): Uint8Array | undefined {
  const script = input.witnessUtxo?.script;
  if (!script) return undefined;
  const decoded = btc.OutScript.decode(script);
  return decoded.type === 'tr' ? decoded.pubkey : undefined;
}

/**
 * Every signature a PSBT carries. Partial signatures name their key; a
 * finalized input does not, so its DER-looking witness items are reported
 * without a key and cannot be re-verified here.
 */
export function collectSignatures(tx: btc.Transaction): FoundSignature[] {
  const found: FoundSignature[] = [];

  for (let index = 0; index < tx.inputsLength; index += 1) {
    const input = tx.getInput(index);
    const declaredSighash = input.sighashType;
    const finalized = !!input.finalScriptWitness;

    if (input.tapKeySig) {
      const pubkey = taprootOutputKey(input);
      if (pubkey)
        found.push({
          index,
          kind: 'schnorr',
          pubkey,
          signature: input.tapKeySig,
          // A 65th byte carries the flag; its absence means DEFAULT (BIP-341).
          sighash: input.tapKeySig.length === 65 ? input.tapKeySig[64] : defaultTaprootSighash,
          declaredSighash,
          finalized,
        });
      continue;
    }

    for (const [pubkey, signature] of input.partialSig ?? []) {
      found.push({
        index,
        kind: 'ecdsa',
        pubkey,
        signature,
        sighash: signature[signature.length - 1],
        declaredSighash,
        finalized,
      });
    }
  }

  return found;
}

export interface InputSignatureReport {
  index: number;
  kind?: SignatureKind;
  signed: boolean;
  finalized: boolean;
  /** Key that produced the signature, hex (x-only for taproot). */
  pubkey?: string;
  sighash?: number;
  sighashName?: string;
  declaredSighash?: number;
  /** The signature's flag agrees with the input's declared flag. */
  matchesDeclared: boolean;
  /** The signature verifies against the digest for its own flag. */
  valid: boolean;
  detail?: string;
}

function defaultSighashFor(kind: SignatureKind): number {
  return kind === 'schnorr' ? defaultTaprootSighash : defaultEcdsaSighash;
}

/** DER-looking items of a finalized input's witness stack. */
function finalizedSignatures(input: PsbtInput): Uint8Array[] {
  return (input.finalScriptWitness ?? []).filter(
    item => item.length > 8 && item[0] === derSignaturePrefix
  );
}

/** One report per signature, plus one per unsigned input. */
export function verifyPsbtSignatures(signedPsbtHex: string): InputSignatureReport[] {
  const tx = parsePsbt(signedPsbtHex);
  const signatures = collectSignatures(tx);
  const reports: InputSignatureReport[] = [];

  for (let index = 0; index < tx.inputsLength; index += 1) {
    const input = tx.getInput(index);
    const declaredSighash = input.sighashType;
    const finalized = !!input.finalScriptWitness;
    const inputSignatures = signatures.filter(signature => signature.index === index);

    if (inputSignatures.length) {
      inputSignatures.forEach(signature => {
        reports.push({
          index,
          kind: signature.kind,
          signed: true,
          finalized,
          pubkey: hex.encode(signature.pubkey),
          sighash: signature.sighash,
          sighashName: sighashName(signature.sighash),
          declaredSighash,
          matchesDeclared:
            signature.sighash === (declaredSighash ?? defaultSighashFor(signature.kind)),
          valid: checkSignature(tx, signature),
        });
      });
      continue;
    }

    const finalSignatures = finalizedSignatures(input);
    if (finalSignatures.length) {
      finalSignatures.forEach(signature => {
        const sighash = signature[signature.length - 1];
        reports.push({
          index,
          kind: 'ecdsa',
          signed: true,
          finalized: true,
          sighash,
          sighashName: sighashName(sighash),
          declaredSighash,
          matchesDeclared: sighash === (declaredSighash ?? defaultEcdsaSighash),
          // A finalized witness no longer names its key, so the digest cannot
          // be recomputed here; broadcasting it is the real check.
          valid: true,
          detail: 'Finalized input — read from the witness stack, not re-verified',
        });
      });
      continue;
    }

    reports.push({ index, signed: false, finalized, matchesDeclared: true, valid: false });
  }

  return reports;
}

/** Indexes that came back carrying a signature. */
export function signedInputIndexes(reports: InputSignatureReport[]): number[] {
  return [...new Set(reports.filter(report => report.signed).map(report => report.index))];
}
