// Aggregates the per-area catalogs into the list the UI and the runners read.
import { bitcoinMethods } from './methods/bitcoin';
import { bondMethods } from './methods/bonds';
import { builderCombinationSpecs, findBuilderSpec } from './methods/builders';
import { generalMethods } from './methods/general';
import { localMethods } from './methods/local';
import { multisigMethods } from './methods/multisig';
import { sighashMethods } from './methods/sighash';
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
  'Sighash',
  'Stacks',
  'Staking',
  'Multisig',
  'Bonds',
  'Local',
];

export const rpcMethods: RpcMethodSpec[] = [
  ...generalMethods,
  ...bitcoinMethods,
  ...sighashMethods,
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

/**
 * Specs are looked up by id, and a builder's combinations are not in the list:
 * they are points in a product, built on demand. An id like
 * `psbt.inputs_p2tr.sighash_single` still resolves, so every combination stays
 * addressable from the API and the CLI without existing up front.
 */
export function findSpec(id: string): RpcMethodSpec | undefined {
  return rpcMethods.find(spec => spec.id === id) ?? findBuilderSpec(id);
}

/** Every tag in the catalog, for the tag runner and the CLI. */
export function rpcTags(): string[] {
  return [
    ...new Set([...rpcMethods, ...builderCombinationSpecs()].flatMap(spec => spec.tags ?? [])),
  ].sort();
}

/**
 * Tags reach into the builders too: their curated combinations carry tags like
 * `ci`, and an automated run that only saw the listed entries would silently
 * lose the coverage that moved into a builder.
 */
export function specsWithTag(tag: string): RpcMethodSpec[] {
  return [...rpcMethods, ...builderCombinationSpecs()].filter(spec => spec.tags?.includes(tag));
}
