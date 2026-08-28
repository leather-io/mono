// Running one spec end to end and judging the result.
//
// The same code backs the UI's cards, the "run tag" table, the
// `window.__leatherTestApp` API and the Playwright runner, so a verdict means
// the same thing wherever it was produced.
//
// Pure: no React, no `window` — the wallet arrives as a `RequestContext`.
import { resolveParams } from './rpc-methods';
import {
  type Outcome,
  type Platform,
  type RpcMethodSpec,
  type VerifyReport,
  expectationFor,
} from './types';

export type SpecVerdict = 'pass' | 'fail' | 'unjudged';

export interface SpecRun {
  id: string;
  method: string;
  /** Params actually sent; undefined when the builder threw. */
  params?: unknown;
  status: 'success' | 'error';
  /** The wallet's unwrapped result, or the error it rejected with. */
  payload: unknown;
  /** Error code when the wallet rejected with a JSON-RPC error. */
  errorCode?: number;
  expected: Outcome;
  verdict: SpecVerdict;
  /** Why the verdict is what it is, when it is not a plain pass. */
  reason?: string;
  verify?: VerifyReport;
  durationMs: number;
}

/** JSON-RPC error code out of whatever the provider rejected with. */
function errorCodeOf(error: unknown): number | undefined {
  if (!error || typeof error !== 'object') return undefined;
  const record = error as Record<string, unknown>;
  if (typeof record.code === 'number') return record.code;
  const inner = record.error;
  if (
    inner &&
    typeof inner === 'object' &&
    typeof (inner as Record<string, unknown>).code === 'number'
  )
    return (inner as { code: number }).code;
  return undefined;
}

function judge(
  expected: Outcome,
  status: 'success' | 'error',
  errorCode: number | undefined,
  verify: VerifyReport | undefined
): { verdict: SpecVerdict; reason?: string } {
  if (expected === 'manual')
    return verify
      ? { verdict: verify.ok ? 'pass' : 'fail', reason: verify.ok ? undefined : 'a check failed' }
      : { verdict: 'unjudged', reason: 'outcome depends on wallet state' };

  if (expected === 'success') {
    if (status === 'error')
      return { verdict: 'fail', reason: `expected success, got error ${errorCode ?? ''}`.trim() };
    if (verify && !verify.ok) return { verdict: 'fail', reason: 'a check failed' };
    return { verdict: 'pass' };
  }

  if (status === 'success')
    return { verdict: 'fail', reason: `expected error ${expected.error}, got success` };
  if (errorCode !== expected.error)
    return {
      verdict: 'fail',
      reason: `expected error ${expected.error}, got ${errorCode ?? 'none'}`,
    };
  return { verdict: 'pass' };
}

export interface RunSpecOptions {
  /** Which platform's expectation to judge against. Default `extension`. */
  platform?: Platform;
  /** Params to send instead of the spec's own (the UI's JSON editor). */
  params?: unknown;
}

export interface RunSpecDeps {
  /** Sends the request and resolves with the wallet's unwrapped result. */
  ctx: import('./types').RequestContext;
}

/**
 * Resolve a spec's params, send it, run its verifier, and judge the outcome
 * against the platform's expectation.
 */
export async function runSpec(
  spec: RpcMethodSpec,
  { ctx }: RunSpecDeps,
  options: RunSpecOptions = {}
): Promise<SpecRun> {
  const platform = options.platform ?? 'extension';
  const expected = expectationFor(spec, platform);
  const startedAt = Date.now();

  let params: unknown;
  try {
    params = options.params !== undefined ? options.params : await resolveParams(spec, ctx);
  } catch (error) {
    return {
      id: spec.id,
      method: spec.method,
      status: 'error',
      payload: error,
      expected,
      verdict: 'fail',
      reason: 'building the request failed before the wallet was involved',
      durationMs: Date.now() - startedAt,
    };
  }

  try {
    const result = await ctx.request(spec.method, params);
    const verify = spec.verify ? await spec.verify({ ctx, params, result }) : undefined;
    const { verdict, reason } = judge(expected, 'success', undefined, verify);
    return {
      id: spec.id,
      method: spec.method,
      params,
      status: 'success',
      payload: result,
      expected,
      verdict,
      reason,
      verify,
      durationMs: Date.now() - startedAt,
    };
  } catch (error) {
    const errorCode = errorCodeOf(error);
    const { verdict, reason } = judge(expected, 'error', errorCode, undefined);
    return {
      id: spec.id,
      method: spec.method,
      params,
      status: 'error',
      payload: error,
      errorCode,
      expected,
      verdict,
      reason,
      durationMs: Date.now() - startedAt,
    };
  }
}

/**
 * Run specs one after another. Sequential on purpose: each one may open an
 * approval popup, and a wallet shows those one at a time.
 */
export async function runSpecs(
  specs: RpcMethodSpec[],
  deps: RunSpecDeps,
  options: RunSpecOptions = {}
): Promise<SpecRun[]> {
  const runs: SpecRun[] = [];
  for (const spec of specs) {
    runs.push(await runSpec(spec, deps, options));
  }
  return runs;
}
