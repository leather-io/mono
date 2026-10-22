import { writeFileSync } from 'node:fs';
import path from 'node:path';

import type { ConsoleCounts, PageErrorRecord } from './evidence/console-evidence';
import type { SessionMode } from './verify-options';

export const verdictExitCodes = {
  verified: 0,
  'ready-not-met': 2,
  errors: 3,
  env: 4,
} as const;

export type Verdict = keyof typeof verdictExitCodes;

export const usageExitCode = 1;
export const summaryFileName = 'summary.json';

export interface VerdictInputs {
  envFailed: boolean;
  readyMet: boolean;
  blockingErrorCount: number;
  allowConsoleErrors: boolean;
}

export interface ReadySummary {
  target: string;
  testId: string;
  afterMs: number | null;
}

export interface BuildSummary {
  hash: string;
  builtAt: string;
  commit: string;
  rebuilt: boolean;
}

export type ArtifactName = 'screenshot' | 'aria' | 'console' | 'state' | 'buildLog';

export interface VerifySummary {
  verdict: Verdict;
  exitCode: number;
  route: string;
  session: SessionMode;
  network: string;
  ready: ReadySummary;
  pageErrors: PageErrorRecord[];
  console: ConsoleCounts;
  state: Record<string, unknown>;
  build: BuildSummary | null;
  artifacts: Partial<Record<ArtifactName, string>>;
  durationMs: number;
  error?: string;
}

export function decideVerdict({
  envFailed,
  readyMet,
  blockingErrorCount,
  allowConsoleErrors,
}: VerdictInputs): Verdict {
  if (envFailed) return 'env';
  if (!readyMet) return 'ready-not-met';
  if (blockingErrorCount > 0 && !allowConsoleErrors) return 'errors';
  return 'verified';
}

export function writeSummary(outDir: string, summary: VerifySummary): string {
  const summaryPath = path.join(outDir, summaryFileName);
  writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`);
  return summaryPath;
}
