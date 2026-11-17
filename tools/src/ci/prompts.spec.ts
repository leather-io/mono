import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { classifierPromptPath } from '../review-gate/classifier.js';
import { tierJsonSchema } from '../review-gate/decision.js';

const containerTypes = new Set(['object', 'array']);

const schemaNodeSchema = z.object({
  type: z.string().optional(),
  properties: z.record(z.string(), z.unknown()).optional(),
  items: z.unknown().optional(),
});

function isContainer(property: unknown): boolean {
  const node = schemaNodeSchema.safeParse(property);
  return node.success && node.data.type !== undefined && containerTypes.has(node.data.type);
}

function leafFieldNames(schema: unknown): string[] {
  const node = schemaNodeSchema.safeParse(schema);
  if (!node.success) return [];
  const properties = node.data.properties ?? {};
  const leaves = Object.entries(properties)
    .filter(([, property]) => !isContainer(property))
    .map(([name]) => name);
  const nested = [...Object.values(properties), node.data.items].flatMap(leafFieldNames);
  return [...leaves, ...nested];
}

function expectToName(prompt: string, names: readonly string[]): void {
  for (const name of names) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    expect(prompt, `the prompt never names ${name}`).toMatch(new RegExp(`\\b${escaped}\\b`, 'i'));
  }
}

describe('prompts', () => {
  it('names every field the classifier answers with', () => {
    expect(leafFieldNames(tierJsonSchema)).toEqual(['reviews', 'confidence', 'reason', 'summary']);
    expectToName(readFileSync(classifierPromptPath, 'utf8'), leafFieldNames(tierJsonSchema));
  });
});
