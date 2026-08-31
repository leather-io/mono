// Aggregates the per-area catalogs into the list the UI and the runners read.
import { bitcoinMethods } from './methods/bitcoin';
import { bondMethods } from './methods/bonds';
import { generalMethods } from './methods/general';
import { localMethods } from './methods/local';
import { multisigMethods } from './methods/multisig';
import { stacksMethods } from './methods/stacks';
import { stakingMethods } from './methods/staking';
import {
  type RequestContext,
  type RpcCategory,
  type RpcMethodSpec,
  isParamsBuilder,
} from './types';

/** Section order in the UI. */
export const rpcCategories: RpcCategory[] = [
  'General',
  'Bitcoin',
  'Stacks',
  'Staking',
  'Multisig',
  'Bonds',
  'Local',
];

export const rpcMethods: RpcMethodSpec[] = [
  ...generalMethods,
  ...bitcoinMethods,
  ...stacksMethods,
  ...stakingMethods,
  ...multisigMethods,
  ...bondMethods,
  ...localMethods,
];

/** Resolve a spec's params, running its builder against the wallet if needed. */
export async function resolveParams(spec: RpcMethodSpec, ctx: RequestContext): Promise<unknown> {
  if (spec.params === undefined) return undefined;
  return isParamsBuilder(spec.params) ? await spec.params(ctx) : spec.params;
}

export function findSpec(id: string): RpcMethodSpec | undefined {
  return rpcMethods.find(spec => spec.id === id);
}

/** Every tag in the catalog, for the tag runner and the CLI. */
export function rpcTags(): string[] {
  return [...new Set(rpcMethods.flatMap(spec => spec.tags ?? []))].sort();
}

export function specsWithTag(tag: string): RpcMethodSpec[] {
  return rpcMethods.filter(spec => spec.tags?.includes(tag));
}
