// Shared types for the RPC catalog. Every button in the UI is one `RpcMethodSpec`.
import type { RpcEndpointMap, RpcMethodNames } from '@leather.io/rpc';

/** Sections the UI renders, in this order. */
export type RpcCategory = 'General' | 'Bitcoin' | 'Stacks' | 'Multisig';

/**
 * Wallet access handed to `params` builders. The app backs `request` with
 * `window.LeatherProvider`; a Playwright spec can back it with `page.evaluate`,
 * so the same builder produces the same payload in both.
 */
export interface RequestContext {
  /** Send a request and resolve with the wallet's unwrapped `result`. */
  request(method: string, params?: unknown): Promise<unknown>;
}

/** A `params` value built at click time (sync or async — the result is awaited). */
export type ParamsBuilder = (ctx: RequestContext) => unknown;

/** A static `params` value: the JSON object/array sent as-is. */
export type StaticParams = Record<string, unknown> | unknown[];

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
}

export function isParamsBuilder(params: RpcMethodSpec['params']): params is ParamsBuilder {
  return typeof params === 'function';
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
