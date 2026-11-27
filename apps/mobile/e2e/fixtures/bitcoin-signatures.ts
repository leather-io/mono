import { bytesToHex } from '@noble/hashes/utils';
import * as btc from '@scure/btc-signer';
import { tagSchnorr } from '@scure/btc-signer/utils';
import { publicKeyFromSignatureVrs } from '@stacks/transactions';

export interface Prevout {
  script: Uint8Array;
  amount: bigint;
}

type InputProblem = 'missing-input' | 'bad-signature';

const curveOrder = 0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141n;
const halfCurveOrder = curveOrder >> 1n;
const derSequenceTag = 0x30;
const derIntegerTag = 0x02;
const coordinateHexLength = 64;
const schnorrSignatureLength = 64;
const taprootSighashDefault = 0;
const evenKeyPrefix = '02';
const ecdsaRecoveryIds = [0, 1];
const maxPrevoutCombinations = 256;

function toBigInt(bytes: Uint8Array) {
  return bytes.length === 0 ? 0n : BigInt(`0x${bytesToHex(bytes)}`);
}

function toHex32(value: bigint) {
  return value.toString(16).padStart(coordinateHexLength, '0');
}

function modOrder(value: bigint) {
  const remainder = value % curveOrder;
  return remainder >= 0n ? remainder : remainder + curveOrder;
}

function recoverKey(digest: bigint, r: bigint, s: bigint, recoveryId: number) {
  try {
    return publicKeyFromSignatureVrs(toHex32(digest), `0${recoveryId}${toHex32(r)}${toHex32(s)}`);
  } catch {
    return undefined;
  }
}

function readDerInteger(bytes: Uint8Array, offset: number) {
  const tag = bytes.at(offset);
  const length = bytes.at(offset + 1);
  if (tag !== derIntegerTag || length === undefined) return undefined;
  const end = offset + 2 + length;
  if (end > bytes.length) return undefined;
  return { value: toBigInt(bytes.slice(offset + 2, end)), end };
}

function readDerSignature(der: Uint8Array) {
  if (der.at(0) !== derSequenceTag || der.at(1) !== der.length - 2) return undefined;
  const r = readDerInteger(der, 2);
  const s = r ? readDerInteger(der, r.end) : undefined;
  if (!r || !s || s.end !== der.length) return undefined;
  return { r: r.value, s: s.value };
}

function verifyEcdsa(digest: Uint8Array, der: Uint8Array, publicKey: Uint8Array) {
  const signature = readDerSignature(der);
  if (!signature || signature.s > halfCurveOrder) return false;
  const expected = bytesToHex(publicKey);
  return ecdsaRecoveryIds.some(
    id => recoverKey(toBigInt(digest), signature.r, signature.s, id) === expected
  );
}

function verifySchnorr(digest: Uint8Array, signature: Uint8Array, xOnlyKey: Uint8Array) {
  if (signature.length !== schnorrSignatureLength) return false;
  const nonceX = signature.slice(0, schnorrSignatureLength / 2);
  const s = toBigInt(signature.slice(schnorrSignatureLength / 2));
  const keyX = toBigInt(xOnlyKey);
  if (s >= curveOrder || keyX === 0n || keyX >= curveOrder) return false;
  const challenge = modOrder(toBigInt(tagSchnorr('BIP0340/challenge', nonceX, xOnlyKey, digest)));
  const point = recoverKey(modOrder(-s * keyX), keyX, modOrder(-challenge * keyX), 0);
  return point === `${evenKeyPrefix}${bytesToHex(nonceX)}`;
}

function sameBytes(a: Uint8Array, b: Uint8Array) {
  return bytesToHex(a) === bytesToHex(b);
}

function inputVerifies(tx: btc.Transaction, index: number, prevouts: Prevout[]) {
  const prevout = prevouts[index];
  const witness = tx.getInput(index).finalScriptWitness;
  if (!prevout || !witness) return false;
  try {
    const lock = btc.OutScript.decode(prevout.script);
    if (lock.type === 'wpkh') {
      const [signature, publicKey] = witness;
      if (witness.length !== 2 || !signature || !publicKey) return false;
      if (!sameBytes(btc.p2wpkh(publicKey).script, prevout.script)) return false;
      const sighash = signature.at(-1);
      if (sighash === undefined) return false;
      const digest = tx.preimageWitnessV0(
        index,
        btc.p2pkh(publicKey).script,
        sighash,
        prevout.amount
      );
      return verifyEcdsa(digest, signature.slice(0, -1), publicKey);
    }
    if (lock.type === 'tr') {
      const [signature] = witness;
      if (witness.length !== 1 || !signature) return false;
      const sighash =
        signature.length === schnorrSignatureLength
          ? taprootSighashDefault
          : signature.at(schnorrSignatureLength);
      if (sighash === undefined || signature.length > schnorrSignatureLength + 1) return false;
      if (signature.length > schnorrSignatureLength && sighash === taprootSighashDefault)
        return false;
      const digest = tx.preimageWitnessV1(
        index,
        prevouts.map(({ script }) => script),
        sighash,
        prevouts.map(({ amount }) => amount)
      );
      return verifySchnorr(digest, signature.slice(0, schnorrSignatureLength), lock.pubkey);
    }
    return false;
  } catch {
    return false;
  }
}

function witnessFits(witness: Uint8Array[] | undefined, prevout: Prevout) {
  try {
    const lock = btc.OutScript.decode(prevout.script);
    const [, publicKey] = witness ?? [];
    if (lock.type === 'wpkh')
      return !!publicKey && sameBytes(btc.p2wpkh(publicKey).script, prevout.script);
    return lock.type === 'tr' && witness?.length === 1;
  } catch {
    return false;
  }
}

function combinations(candidates: Prevout[][]): Prevout[][] {
  return candidates.reduce<Prevout[][]>(
    (partial, options) =>
      partial
        .flatMap(prefix => options.map(option => [...prefix, option]))
        .slice(0, maxPrevoutCombinations),
    [[]]
  );
}

export function findInputProblem(
  tx: btc.Transaction,
  prevoutsAt: (txid: string, vout: number) => Prevout[]
): InputProblem | undefined {
  const served = Array.from({ length: tx.inputsLength }, (_, index) => {
    const input = tx.getInput(index);
    return input.txid && input.index !== undefined
      ? prevoutsAt(bytesToHex(input.txid), input.index)
      : [];
  });
  if (served.some(options => options.length === 0)) return 'missing-input';
  const candidates = served.map((options, index) =>
    options.filter(prevout => witnessFits(tx.getInput(index).finalScriptWitness, prevout))
  );
  const verified = combinations(candidates).some(prevouts =>
    prevouts.every((_, index) => inputVerifies(tx, index, prevouts))
  );
  return verified ? undefined : 'bad-signature';
}
