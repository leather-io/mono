// Shared types for the RPC catalog. Every button in the UI is one
// `RpcMethodSpec`; every multi-step flow is one `Scenario`.
import type { RpcEndpointMap, RpcMethodNames } from '@leather.io/rpc';

/** Sections the UI renders, in this order. */
export type RpcCategory =
  | 'General'
  | 'Bitcoin'
  | 'Stacks'
  | 'Staking'
  | 'Multisig'
  | 'Bonds'
  | 'Local';

/** Address flavour a wallet network id resolves to. */
export type NetworkMode = 'mainnet' | 'testnet' | 'regtest';

/**
 * Wallet access handed to `params` builders. The app backs `request` with
 * `window.LeatherProvider`; a Playwright spec can back it with `page.evaluate`,
 * so the same builder produces the same payload in both.
 */
export interface RequestContext {
  /** Send a request and resolve with the wallet's unwrapped `result`. */
  request(method: string, params?: unknown): Promise<unknown>;
  /**
   * Wallet network id every request in this run is pinned to, chosen in the
   * header. Omitted means `mainnet` — read it through `networkOf` so callers
   * that never set it (older specs, plain Playwright contexts) still work.
   */
  network?: string;
}

/** A `params` value built at click time (sync or async — the result is awaited). */
export type ParamsBuilder = (ctx: RequestContext) => unknown;

/** A static `params` value: the JSON object/array sent as-is. */
export type StaticParams = Record<string, unknown> | unknown[];

/** Wallet platforms whose behaviour a spec can predict separately. */
export type Platform = 'extension' | 'mobile';

/**
 * What a spec should do. `manual` means the outcome depends on wallet state a
 * spec cannot assert (funds, the account the user selected), so the runner
 * records the result without judging it.
 */
export type Outcome = 'success' | 'manual' | { error: number };

export interface PlatformOutcomes {
  extension: Outcome;
  mobile?: Outcome;
}

export type Expectation = Outcome | PlatformOutcomes;

/**
 * Wallet state a spec needs before it can pass. The UI annotates cards with
 * what is missing; the automated runner skips the tags it cannot satisfy.
 */
export type Requirement =
  | 'singlesig'
  | 'btc-policy'
  | 'stx-policy'
  | 'regtest-funds'
  | 'mainnet-funds'
  | 'devnet'
  | 'esplora'
  | 'ledger';

export interface VerifyCheck {
  label: string;
  ok: boolean;
  detail?: string;
}

export interface VerifyReport {
  ok: boolean;
  checks: VerifyCheck[];
}

export interface VerifyArgs {
  ctx: RequestContext;
  /** Params actually sent (after any manual edit in the JSON editor). */
  params: unknown;
  /** The wallet's unwrapped `result`. */
  result: unknown;
}

/**
 * Checks the response beyond "did it resolve" — that the signature the wallet
 * produced is valid for the sighash flag it stamped, that post conditions
 * survived, that only the requested input was signed.
 */
export type Verifier = (args: VerifyArgs) => VerifyReport | Promise<VerifyReport>;

export interface RpcMethodSpec {
  /** Unique id for this button; also its `data-testid`. */
  id: string;
  /** Wallet RPC method name passed to `LeatherProvider.request`. */
  method: string;
  /** Human label for the button. */
  label: string;
  category: RpcCategory;
  /** What the call does / what to expect (shown on the card). */
  description: string;
  /**
   * Params sent to the wallet. Omit for no-param methods. A `ParamsBuilder`
   * is resolved on click — use it where the payload must be built at call
   * time (serializing a transaction, reading the wallet's addresses, …).
   */
  params?: StaticParams | ParamsBuilder;
  /** Expected outcome, per platform where the platforms disagree. */
  expect?: Expectation;
  /** Wallet state this spec needs. */
  requires?: Requirement[];
  /** Free-form labels the runner and the UI filter on. */
  tags?: string[];
  /** Extra assertions run against the response. */
  verify?: Verifier;
}

export function isParamsBuilder(params: RpcMethodSpec['params']): params is ParamsBuilder {
  return typeof params === 'function';
}

/** The network a context is pinned to; `mainnet` when a caller sets none. */
export function networkOf(ctx: RequestContext): string {
  return ctx.network ?? 'mainnet';
}

/** The expectation that applies to `platform`, defaulting to `manual`. */
export function expectationFor(spec: RpcMethodSpec, platform: Platform): Outcome {
  const expectation = spec.expect;
  if (!expectation) return 'manual';
  if (typeof expectation === 'string' || 'error' in expectation) return expectation;
  return expectation[platform] ?? 'manual';
}

//
// Scenarios: ordered steps sharing state, for flows a single request cannot
// express (register an account, fund it, propose, co-sign, finalize).

export interface ScenarioState {
  [key: string]: unknown;
}

export interface ScenarioStepArgs {
  ctx: RequestContext;
  state: ScenarioState;
}

export interface ScenarioStepResult {
  /** One line describing what happened, shown next to the step. */
  summary: string;
  /** Merged into the scenario state for later steps. */
  state?: ScenarioState;
  checks?: VerifyCheck[];
}

export interface ScenarioStep {
  id: string;
  label: string;
  /**
   * What the developer must do in the wallet BEFORE this step runs (switch
   * account, mine blocks). The runner pauses and shows it.
   */
  instruction?: string;
  // Sync steps are allowed: several do nothing but fold local state, and an
  // `async` wrapper with no await is just noise.
  run(args: ScenarioStepArgs): ScenarioStepResult | Promise<ScenarioStepResult>;
}

export interface Scenario {
  id: string;
  label: string;
  description: string;
  requires?: Requirement[];
  tags?: string[];
  steps: ScenarioStep[];
}

/**
 * Params type for a method as typed in `@leather.io/rpc`. Use it as
 * `params: { … } satisfies ParamsOf<'signPsbt'>` to catch misspelled or
 * mistyped fields at typecheck time. If the workspace schema does not know a
 * field the extension already accepts, drop `satisfies` for that entry and say
 * so in the description.
 */
export type ParamsOf<M extends RpcMethodNames> = RpcEndpointMap[M]['request'] extends {
  params?: infer P;
}
  ? NonNullable<P>
  : never;
