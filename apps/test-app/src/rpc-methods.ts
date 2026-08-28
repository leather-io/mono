// The catalog the UI renders. Each entry in `rpcMethods` becomes one button;
// buttons are grouped by `category` in `rpcCategories` order.
//
// To add a request, append an `RpcMethodSpec` to the matching file in
// ./methods/ (see README.md for the recipe).
import { bitcoinMethods } from './methods/bitcoin';
import { generalMethods } from './methods/general';
import { multisigMethods } from './methods/multisig';
import { stacksMethods } from './methods/stacks';
import {
  type RequestContext,
  type RpcCategory,
  type RpcMethodSpec,
  isParamsBuilder,
} from './types';

export const rpcCategories: RpcCategory[] = ['General', 'Bitcoin', 'Stacks', 'Multisig'];

export const rpcMethods: RpcMethodSpec[] = [
  ...generalMethods,
  ...bitcoinMethods,
  ...stacksMethods,
  ...multisigMethods,
];

// Fail loudly at import time on a copy-pasted id, which would otherwise make
// two cards share busy/result state and break `data-testid` lookups.
const ids = new Set<string>();
for (const spec of rpcMethods) {
  if (ids.has(spec.id)) throw new Error(`Duplicate RpcMethodSpec id: ${spec.id}`);
  ids.add(spec.id);
}

/** The exact params a spec sends: static value, or its builder run against `ctx`. */
export function resolveParams(spec: RpcMethodSpec, ctx: RequestContext): Promise<unknown> {
  return Promise.resolve(isParamsBuilder(spec.params) ? spec.params(ctx) : spec.params);
}
