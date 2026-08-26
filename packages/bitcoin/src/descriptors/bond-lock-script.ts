import { hex } from '@scure/base';
import { Script } from '@scure/btc-signer';
import { OpToNum } from '@scure/btc-signer/script';
import { equalBytes } from '@scure/btc-signer/utils';

export interface BondLockScript {
  unlockHeight: number;
  hashHex: string;
  covenantPubkey: string;
  threshold: number;
  // script order — the order OP_CHECKMULTISIG verifies signatures in
  stakerPubkeys: string[];
}

// BIP-65/BIP-113 type boundary: lock values below are block heights, at or above are timestamps
export const minTimestampLockTime = 500_000_000;

type ScriptOp = ReturnType<typeof Script.decode>[number];

function isCompressedPubkey(op: ScriptOp | undefined): op is Uint8Array {
  return op instanceof Uint8Array && op.length === 33 && (op[0] === 0x02 || op[0] === 0x03);
}

function decodeScriptInt(op: ScriptOp | undefined): number | null {
  if (op === undefined) return null;
  const value = OpToNum(op);
  return value !== undefined && value >= 0 ? value : null;
}

const fixedOpsBeforeMulti = 14;

export function parseBondLockScript(witnessScript: Uint8Array): BondLockScript | null {
  let ops: ReturnType<typeof Script.decode>;
  try {
    ops = Script.decode(witnessScript);
  } catch {
    return null;
  }
  if (ops.length < fixedOpsBeforeMulti + 4) return null;

  const [
    opIf,
    heightOp,
    cltv,
    opElse,
    opSize,
    sizeOperand,
    equalVerify1,
    opSha256,
    hashOp,
    equalVerify2,
    covenantOp,
    checkSig,
    endIf,
    verify,
  ] = ops;
  if (
    opIf !== 'IF' ||
    cltv !== 'CHECKLOCKTIMEVERIFY' ||
    opElse !== 'ELSE' ||
    opSize !== 'SIZE' ||
    equalVerify1 !== 'EQUALVERIFY' ||
    opSha256 !== 'SHA256' ||
    equalVerify2 !== 'EQUALVERIFY' ||
    checkSig !== 'CHECKSIG' ||
    endIf !== 'ENDIF' ||
    verify !== 'VERIFY'
  ) {
    return null;
  }
  const unlockHeight = decodeScriptInt(heightOp);
  if (unlockHeight === null || unlockHeight < 1 || unlockHeight >= minTimestampLockTime) {
    return null;
  }
  if (decodeScriptInt(sizeOperand) !== 32) return null;
  if (!(hashOp instanceof Uint8Array) || hashOp.length !== 32) return null;
  if (!isCompressedPubkey(covenantOp)) return null;

  const multiOps = ops.slice(fixedOpsBeforeMulti);
  if (multiOps[multiOps.length - 1] !== 'CHECKMULTISIG') return null;
  const threshold = decodeScriptInt(multiOps[0]);
  const totalKeys = decodeScriptInt(multiOps[multiOps.length - 2]);
  if (threshold === null || totalKeys === null) return null;
  if (threshold < 1 || threshold > totalKeys || totalKeys > 20) return null;
  const keyOps = multiOps.slice(1, -2);
  if (keyOps.length !== totalKeys) return null;
  const stakerKeys: Uint8Array[] = [];
  for (const op of keyOps) {
    if (!isCompressedPubkey(op)) return null;
    stakerKeys.push(op);
  }

  // Exact recipe of @stacks/bitcoin-staking buildLockScript; the byte-equality below rejects any deviation, non-minimal pushes included.
  const rebuilt = Script.encode([
    'IF',
    unlockHeight,
    'CHECKLOCKTIMEVERIFY',
    'ELSE',
    'SIZE',
    32,
    'EQUALVERIFY',
    'SHA256',
    hashOp,
    'EQUALVERIFY',
    covenantOp,
    'CHECKSIG',
    'ENDIF',
    'VERIFY',
    threshold,
    ...stakerKeys,
    totalKeys,
    'CHECKMULTISIG',
  ]);
  if (!equalBytes(rebuilt, witnessScript)) return null;

  return {
    unlockHeight,
    hashHex: hex.encode(hashOp),
    covenantPubkey: hex.encode(covenantOp),
    threshold,
    stakerPubkeys: stakerKeys.map(key => hex.encode(key)),
  };
}
