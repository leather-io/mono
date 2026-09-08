// Reusable `verify` hooks for specs. Each one turns a raw response into
// pass/fail checks the UI and the automated runner can read, so a spec asserts
// what the wallet DID rather than that it answered at all.
//
// Pure: no React, no `window`.
import { networkModeOf } from '../networks';
import { type Verifier, type VerifyCheck, type VerifyReport, networkOf } from '../types';
import { decodePsbt } from './psbt-decode';
import { type InputSignatureReport, verifyPsbtSignatures } from './psbt-signatures';
import { verifySighashSemantics } from './sighash-semantics';
import { decodeStxTransaction } from './stx-decode';

function fail(label: string, detail: string): VerifyReport {
  return { ok: false, checks: [{ label, ok: false, detail }] };
}

function readString(value: unknown, key: string): string | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const field = (value as Record<string, unknown>)[key];
  return typeof field === 'string' ? field : undefined;
}

export interface SignedPsbtExpectations {
  /** Exactly these input indexes must come back signed. */
  signedIndexes?: number[];
  /** Every signature must carry this flag. */
  sighash?: number;
  /** Also prove the flag commits to what it claims, by mutating the tx. */
  semantics?: boolean;
  /** No input may be signed — for requests the wallet should refuse to sign. */
  expectUnsigned?: boolean;
}

/**
 * Checks a `signPsbt` response: every signature verifies against the digest
 * for its own flag, the declared flag and the stamped flag agree, and the
 * right inputs were signed.
 */
export function verifySignedPsbt(expectations: SignedPsbtExpectations = {}): Verifier {
  return ({ ctx, result }) => {
    const signedHex = readString(result, 'hex');
    if (!signedHex) return fail('response carries a PSBT', 'No `hex` in the response');

    let reports: InputSignatureReport[];
    try {
      reports = verifyPsbtSignatures(signedHex);
    } catch (error) {
      return fail('PSBT parses', error instanceof Error ? error.message : String(error));
    }

    const checks: VerifyCheck[] = [];
    const signed = reports.filter(report => report.signed);

    if (expectations.expectUnsigned) {
      checks.push({
        label: 'wallet added no signature',
        ok: signed.length === 0,
        detail: signed.length
          ? `signed input(s) ${signed.map(r => r.index).join(', ')}`
          : undefined,
      });
    } else {
      checks.push({
        label: 'at least one input signed',
        ok: signed.length > 0,
        detail: signed.length ? undefined : 'the wallet returned the PSBT unchanged',
      });
    }

    signed.forEach(report => {
      checks.push({
        label: `input ${report.index} signature verifies (${report.sighashName})`,
        ok: report.valid,
        detail: report.detail,
      });
      checks.push({
        label: `input ${report.index} flag matches the input's declared sighash`,
        ok: report.matchesDeclared,
        detail: report.matchesDeclared
          ? undefined
          : `signature says ${report.sighashName}, input declares ${report.declaredSighash}`,
      });
      if (expectations.sighash !== undefined)
        checks.push({
          label: `input ${report.index} signed with the requested flag`,
          ok: report.sighash === expectations.sighash,
          detail: `got ${report.sighash}, expected ${expectations.sighash}`,
        });
    });

    if (expectations.signedIndexes) {
      const actual = [...new Set(signed.map(report => report.index))].sort();
      const expected = [...expectations.signedIndexes].sort();
      checks.push({
        label: `only input(s) ${expected.join(', ')} signed`,
        ok: JSON.stringify(actual) === JSON.stringify(expected),
        detail: `signed: [${actual.join(', ')}]`,
      });
    }

    if (expectations.semantics) {
      const semantics = verifySighashSemantics(signedHex);
      checks.push(...semantics.checks);
    }

    // Decoding is not an assertion, but a decode failure means the response is
    // not a PSBT the rest of the pipeline can read.
    try {
      decodePsbt(signedHex, networkModeOf(networkOf(ctx)));
    } catch (error) {
      checks.push({
        label: 'PSBT decodes',
        ok: false,
        detail: error instanceof Error ? error.message : String(error),
      });
    }

    return { ok: checks.every(check => check.ok), checks };
  };
}

export interface StxTransactionExpectations {
  postConditionMode?: 'allow' | 'deny' | 'originator';
  postConditionCount?: number;
  contract?: string;
  functionName?: string;
  /** The transaction must be signed by the account that owns this address. */
  senderIsSelectedAccount?: boolean;
}

/**
 * Checks a Stacks response that carries a serialized transaction: the post
 * conditions and MODE survived the round trip, the payload is the call that
 * was requested, and the wallet actually signed it.
 */
export function verifyStxTransaction(expectations: StxTransactionExpectations = {}): Verifier {
  return ({ result }) => {
    const txHex = readString(result, 'transaction') ?? readString(result, 'txHex');
    if (!txHex)
      return fail('response carries a transaction', 'No `transaction` / `txHex` in the response');

    let decoded: ReturnType<typeof decodeStxTransaction>;
    try {
      decoded = decodeStxTransaction(txHex);
    } catch (error) {
      return fail('transaction parses', error instanceof Error ? error.message : String(error));
    }

    const checks: VerifyCheck[] = [{ label: 'transaction is signed', ok: decoded.signed }];

    if (expectations.postConditionMode)
      checks.push({
        label: `post-condition mode is ${expectations.postConditionMode}`,
        ok: decoded.postConditionMode === expectations.postConditionMode,
        detail: `got ${decoded.postConditionMode}`,
      });

    if (expectations.postConditionCount !== undefined)
      checks.push({
        label: `${expectations.postConditionCount} post condition(s) survived`,
        ok: decoded.postConditions.length === expectations.postConditionCount,
        detail: `got ${decoded.postConditions.length}`,
      });

    if (expectations.contract || expectations.functionName) {
      const payload = decoded.payload;
      checks.push({
        label: 'payload is the requested contract call',
        ok:
          payload.type === 'contract-call' &&
          (!expectations.contract || payload.contract === expectations.contract) &&
          (!expectations.functionName || payload.functionName === expectations.functionName),
        detail:
          payload.type === 'contract-call'
            ? `${payload.contract}::${payload.functionName}`
            : `payload type ${payload.type}`,
      });
    }

    return { ok: checks.every(check => check.ok), checks };
  };
}

/**
 * Checks a multisig response: the wallet proposed instead of broadcasting, so
 * the co-signers have something to approve.
 */
export function verifyProposal(): Verifier {
  return ({ result }) => {
    const status = readString(result, 'status');
    const proposalId = readString(result, 'proposalId');
    const txid = readString(result, 'txid');
    return {
      ok: status === 'proposed' && !!proposalId && !txid,
      checks: [
        { label: 'status is "proposed"', ok: status === 'proposed', detail: `got ${status}` },
        { label: 'a proposalId came back', ok: !!proposalId },
        { label: 'nothing was broadcast', ok: !txid, detail: txid ? `txid ${txid}` : undefined },
      ],
    };
  };
}

/** Checks that an address response contains the chains that were asked for. */
export function verifyAddresses(expected: { bitcoin?: boolean; stacks?: boolean }): Verifier {
  return ({ result }) => {
    const addresses =
      result &&
      typeof result === 'object' &&
      Array.isArray((result as { addresses?: unknown }).addresses)
        ? ((result as { addresses: { symbol?: string }[] }).addresses ?? [])
        : [];
    const hasBtc = addresses.some(address => address.symbol === 'BTC');
    const hasStx = addresses.some(address => address.symbol === 'STX');
    const checks: VerifyCheck[] = [{ label: 'addresses returned', ok: addresses.length > 0 }];
    if (expected.bitcoin !== undefined)
      checks.push({
        label: expected.bitcoin ? 'includes BTC addresses' : 'excludes BTC addresses',
        ok: hasBtc === expected.bitcoin,
      });
    if (expected.stacks !== undefined)
      checks.push({
        label: expected.stacks ? 'includes STX addresses' : 'excludes STX addresses',
        ok: hasStx === expected.stacks,
      });
    return { ok: checks.every(check => check.ok), checks };
  };
}
