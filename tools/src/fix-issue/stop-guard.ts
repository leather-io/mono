import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

import type { FixIssuePaths } from './paths.js';
import { readReview } from './review.js';
import { readStatus } from './status.js';

export const guardedOutputSchema = z.enum(['status', 'review']);
type GuardedOutput = z.infer<typeof guardedOutputSchema>;

export const maxStopBlocks = 3;

interface StopBlock {
  readonly decision: 'block';
  readonly reason: string;
}

function outputFile(paths: FixIssuePaths, output: GuardedOutput): string {
  return output === 'status' ? paths.statusFile : paths.reviewFile;
}

function counterFile(paths: FixIssuePaths, output: GuardedOutput): string {
  return path.join(paths.workDir, `stop-guard-${output}.count`);
}

function outputProblem(paths: FixIssuePaths, output: GuardedOutput): string | null {
  const file = outputFile(paths, output);
  if (!existsSync(file)) return 'does not exist yet';
  if (output === 'status') {
    const status = readStatus(file);
    return status.ok ? null : `is not valid yet (${status.problems.join('; ')})`;
  }
  try {
    readReview(file);
    return null;
  } catch (error) {
    return `is not valid yet (${error instanceof Error ? error.message : String(error)})`;
  }
}

function readBlocks(file: string): number {
  if (!existsSync(file)) return 0;
  const count = Number(readFileSync(file, 'utf8').trim());
  return Number.isInteger(count) && count > 0 ? count : 0;
}

export function resetStopGuards(paths: FixIssuePaths): void {
  for (const output of guardedOutputSchema.options) {
    rmSync(counterFile(paths, output), { force: true });
  }
}

export function decideStop(paths: FixIssuePaths, output: GuardedOutput): StopBlock | null {
  const problem = outputProblem(paths, output);
  if (problem === null) return null;
  const counter = counterFile(paths, output);
  const blocks = readBlocks(counter);
  if (blocks >= maxStopBlocks) return null;
  mkdirSync(paths.workDir, { recursive: true });
  writeFileSync(counter, `${blocks + 1}\n`);
  const file = path.relative(paths.root, outputFile(paths, output));
  return {
    decision: 'block',
    reason: `You are ending your turn, but ${file} ${problem}. This run is headless: the session ends with your turn, and you are never notified when a background command or sub-agent finishes. Wait for each one you started by reading its output until it is done, then write ${file} as your instructions describe, and only then end your turn.`,
  };
}
