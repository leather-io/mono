import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

import { type CommandRunner, runCommand } from './exec.js';
import { treeSnapshot } from './git.js';
import type { FixIssuePaths } from './paths.js';
import { type Review, readReview } from './review.js';
import { maxFollowUps, readState, readStatus, writeStatus } from './status.js';
import { resetStopGuards } from './stop-guard.js';
import { reviseCheck, verifyFix } from './verify.js';

const outcomeSchema = z.enum(['clean', 'failed', 'blocked']);
type RoundOutcome = z.infer<typeof outcomeSchema>;

const runStateSchema = z.object({
  rounds: z.array(
    z.object({ round: z.number().int().positive(), outcome: outcomeSchema, summary: z.string() })
  ),
});
type RunState = z.infer<typeof runStateSchema>;

interface RoundEnd {
  readonly outcome: RoundOutcome;
  readonly continue: boolean;
  readonly summary: string;
}

export function parseRound(value: string): number {
  if (!/^[1-9]$/.test(value)) throw new Error(`'${value}' is not a round number from 1 to 9`);
  return Number(value);
}

function roundDir(paths: FixIssuePaths, round: number): string {
  return path.join(paths.roundsDir, String(round));
}

function readRunState(paths: FixIssuePaths): RunState {
  if (!existsSync(paths.runFile)) return { rounds: [] };
  return runStateSchema.parse(JSON.parse(readFileSync(paths.runFile, 'utf8')));
}

function writeRunState(paths: FixIssuePaths, state: RunState): void {
  writeFileSync(paths.runFile, `${JSON.stringify(state, null, 2)}\n`);
}

function clearRound(paths: FixIssuePaths, round: number): void {
  resetStopGuards(paths);
  for (const file of [paths.verifyReport, paths.reviewFile, paths.reviewSnapshot]) {
    rmSync(file, { force: true });
  }
  mkdirSync(roundDir(paths, round), { recursive: true });
}

function snapshotForReview(paths: FixIssuePaths): void {
  mkdirSync(paths.workDir, { recursive: true });
  writeFileSync(paths.reviewSnapshot, treeSnapshot(paths.root));
}

export function verifyRound(paths: FixIssuePaths, round: number, run?: CommandRunner): boolean {
  clearRound(paths, round);
  const result = verifyFix({
    root: paths.root,
    statusFile: paths.statusFile,
    reportFile: paths.verifyReport,
    run,
    revise: reviseCheck(paths.reviseFile),
  });
  if (result.passed) rmSync(paths.verifyReport, { force: true });
  const verified = result.passed && !result.skipped;
  if (verified) snapshotForReview(paths);
  return verified;
}

export function checkReview(paths: FixIssuePaths): number | null {
  if (!existsSync(paths.reviewSnapshot)) {
    throw new Error(`${paths.reviewSnapshot} does not exist; run the snapshot step first`);
  }
  if (treeSnapshot(paths.root) !== readFileSync(paths.reviewSnapshot, 'utf8')) {
    const changed = runCommand('git', ['status', '--short'], { cwd: paths.root }).stdout;
    throw new Error(`the review changed files; it may only write the review file\n${changed}`);
  }
  const review = tryReadReview(paths.reviewFile);
  return 'problem' in review ? null : review.review.blocking.length;
}

type ReviewRead = { readonly review: Review } | { readonly problem: string };

function tryReadReview(file: string): ReviewRead {
  if (!existsSync(file)) return { problem: 'the review ended without writing its review file' };
  try {
    return { review: readReview(file) };
  } catch {
    return { problem: 'the review wrote an invalid review file' };
  }
}

function checksSummary(paths: FixIssuePaths): string | null {
  if (existsSync(paths.verifyReport)) {
    const firstLine = readFileSync(paths.verifyReport, 'utf8').split('\n')[0] ?? '';
    return firstLine.replace(/^FAILED: /, '');
  }
  if (!existsSync(paths.reviewSnapshot)) return null;
  const read = tryReadReview(paths.reviewFile);
  if ('problem' in read) return read.problem;
  const blocking = read.review.blocking.length;
  return blocking === 0
    ? 'checks passed and review found no critical, blocker or regression findings'
    : `review found ${blocking} critical, blocker or regression findings`;
}

function decideOutcome(
  paths: FixIssuePaths,
  round: number
): { outcome: RoundOutcome; summary: string } {
  const checks = checksSummary(paths);
  if (readState(paths.statusFile) === 'blocked') {
    const stopped = `Round ${round}: the fixer stopped as blocked`;
    return { outcome: 'blocked', summary: checks ? `${stopped}; ${checks}` : stopped };
  }
  if (checks === null && existsSync(paths.reviseFile)) {
    return {
      outcome: 'clean',
      summary: `Round ${round}: the revise changed nothing and only answers the feedback`,
    };
  }
  if (checks === null) {
    throw new Error(`round ${round} has neither a verify report nor a review`);
  }
  const read = tryReadReview(paths.reviewFile);
  const passed =
    !existsSync(paths.verifyReport) && 'review' in read && read.review.blocking.length === 0;
  return { outcome: passed ? 'clean' : 'failed', summary: `Round ${round}: ${checks}` };
}

function oneLine(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function unfixedFindingsQuestion(paths: FixIssuePaths, round: number): string | null {
  const file = path.join(roundDir(paths, round), path.basename(paths.reviewFile));
  const read = tryReadReview(file);
  if ('problem' in read) return null;
  const { blocking } = read.review;
  if (blocking.length === 0) return null;
  const findings = blocking.map(
    finding => `${finding.kind} at ${oneLine(finding.location)}: ${oneLine(finding.defect)}`
  );
  return `The review found ${blocking.length} critical, blocker or regression findings that no round fixed because the fixer stopped as blocked: ${findings.join('; ')}. Options: answer the questions and dispatch again; fix them on this branch by hand.`;
}

function pendingHandoffs(paths: FixIssuePaths): readonly string[] {
  const status = readStatus(paths.statusFile);
  return status.ok ? status.status.handoff.map(handoff => handoff.path) : [];
}

function failsWhileHandoffsPending(paths: FixIssuePaths, round: number): boolean {
  const report = path.join(roundDir(paths, round), path.basename(paths.verifyReport));
  return existsSync(report) && pendingHandoffs(paths).length > 0;
}

export function endRound(paths: FixIssuePaths, round: number): RoundEnd {
  resetStopGuards(paths);
  const { outcome, summary } = decideOutcome(paths, round);
  const dir = roundDir(paths, round);
  mkdirSync(dir, { recursive: true });
  for (const file of [paths.verifyReport, paths.reviewFile]) {
    if (existsSync(file)) copyFileSync(file, path.join(dir, path.basename(file)));
  }
  const state = readRunState(paths);
  writeRunState(paths, {
    rounds: [...state.rounds.filter(entry => entry.round !== round), { round, outcome, summary }],
  });
  const waitsOnHandoffs = outcome === 'failed' && failsWhileHandoffsPending(paths, round);
  return {
    outcome,
    continue: outcome === 'failed' && !waitsOnHandoffs,
    summary,
  };
}

interface FollowUp {
  readonly file: string | null;
  readonly line: string;
}

const followUpLocationPattern = /^`?([^`\s:]+)(:\d+)?`?:\s+(.+)$/s;

function formatFollowUp(location: string, note: string): string {
  return `\`${oneLine(location)}\`: ${oneLine(note)}`;
}

function parseOwnFollowUp(entry: string): FollowUp {
  const match = followUpLocationPattern.exec(entry.trim());
  if (!match?.[1] || !match[3]) return { file: null, line: entry };
  return {
    file: match[1],
    line: formatFollowUp(`${match[1]}${match[2] ?? ''}`, match[3]),
  };
}

function reviewFollowUps(paths: FixIssuePaths, round: number): FollowUp[] {
  const read = tryReadReview(path.join(roundDir(paths, round), path.basename(paths.reviewFile)));
  if ('problem' in read) return [];
  return read.review.minor.map(finding => ({
    file: finding.location.replace(/:\d+$/, ''),
    line: formatFollowUp(finding.location, finding.note),
  }));
}

function mergeFollowUps(own: readonly string[], fromReview: readonly FollowUp[]): string[] {
  const ownFollowUps = own.map(parseOwnFollowUp);
  const ownFiles = new Set(ownFollowUps.map(followUp => followUp.file));
  const reviewOnly = fromReview.filter(followUp => !ownFiles.has(followUp.file));
  return [...new Set([...ownFollowUps, ...reviewOnly].map(followUp => followUp.line))].slice(
    0,
    maxFollowUps
  );
}

export function finishRounds(paths: FixIssuePaths): RoundOutcome {
  const rounds = [...readRunState(paths).rounds].sort((a, b) => a.round - b.round);
  const last = rounds.at(-1);
  if (!last) throw new Error('no round ran');
  const status = readStatus(paths.statusFile);
  if (!status.ok) {
    throw new Error(`the fixer never wrote a valid status:\n  ${status.problems.join('\n  ')}`);
  }
  const summaries = rounds.map(entry => entry.summary);
  const lastReason = last.summary.replace(/^Round \d+: /, '');
  const unfixed = last.outcome === 'blocked' ? unfixedFindingsQuestion(paths, last.round) : null;
  const followUps = mergeFollowUps(status.status.followUps, reviewFollowUps(paths, last.round));
  const handoffs = pendingHandoffs(paths).map(file => `\`${file}\``);
  const failedQuestion = failsWhileHandoffsPending(paths, last.round)
    ? `${lastReason} in round ${last.round} while the changes to ${handoffs.join(', ')} still wait on a maintainer, so no further round ran. Options: make those changes on this branch and check the failure is gone; dispatch again with guidance in the brief if it stays.`
    : `The fix still fails after ${last.round} rounds (${lastReason}). Options: dispatch again with guidance in the brief; take the branch over locally.`;
  writeStatus(
    paths.statusFile,
    last.outcome === 'failed'
      ? {
          ...status.status,
          followUps,
          state: 'blocked',
          tested: [...summaries, ...status.status.tested],
          questions: [...status.status.questions, failedQuestion],
        }
      : {
          ...status.status,
          followUps,
          tested: [...summaries, ...status.status.tested],
          questions: unfixed ? [...status.status.questions, unfixed] : status.status.questions,
        }
  );
  return last.outcome;
}
