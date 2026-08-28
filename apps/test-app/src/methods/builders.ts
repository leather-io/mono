// Every request family declared as choices rather than as entries.
//
// Kept apart from ./builders/spec-builder (the types and the id codec) so the
// individual builders can import those without importing the registry back.
import {
  type BuilderSelection,
  type SpecBuilder,
  buildFromSelection,
  parseBuilderSpecId,
} from '../builders/spec-builder';
import type { RpcMethodSpec } from '../types';
import { psbtBuilder } from './psbt-builder';
import { stxOptionsBuilder } from './stx-options-builder';

export const specBuilders: SpecBuilder[] = [psbtBuilder, stxOptionsBuilder];

export function findBuilder(id: string): SpecBuilder | undefined {
  return specBuilders.find(builder => builder.id === id);
}

/** Rebuild the spec an id names, if any builder recognises it. */
export function findBuilderSpec(id: string): RpcMethodSpec | undefined {
  for (const builder of specBuilders) {
    const selection = parseBuilderSpecId(builder, id);
    if (selection) return builder.build(selection);
  }
  return undefined;
}

/** The curated sweep of one builder, or of all of them. */
export function builderCombinationSpecs(builderId?: string): RpcMethodSpec[] {
  const builders = builderId ? specBuilders.filter(b => b.id === builderId) : specBuilders;
  return builders.flatMap(builder =>
    builder.combinations().map(selection => buildFromSelection(builder, selection))
  );
}

export function buildSpec(builderId: string, selection: Partial<BuilderSelection>): RpcMethodSpec {
  const builder = findBuilder(builderId);
  if (!builder) throw new Error(`No spec builder with id ${builderId}`);
  return buildFromSelection(builder, selection);
}
