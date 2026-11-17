import { buildClaudeArgs } from '../ci/claude.js';
import { promptPath } from '../ci/prompts.js';
import { tierJsonSchema } from './decision.js';

export const classifierPromptPath = promptPath('review-gate-classifier');

export function buildClassifierArgs(): string[] {
  return buildClaudeArgs({ systemPromptPath: classifierPromptPath, schema: tierJsonSchema });
}
