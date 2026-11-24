import path from 'node:path';

import { buildClaudeArgs } from '../ci/claude.js';
import { getMonorepoRoot } from '../utils/paths.js';
import { tierJsonSchema } from './decision.js';

export const classifierPromptPath = path.join(
  getMonorepoRoot(),
  '.github',
  'prompts',
  'review-gate-classifier.md'
);

export function buildClassifierArgs(): string[] {
  return buildClaudeArgs({ systemPromptPath: classifierPromptPath, schema: tierJsonSchema });
}
