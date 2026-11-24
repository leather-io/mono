import { lstatSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { runCommand, runOrThrow } from './exec.js';

interface MergePlan {
  readonly merge: boolean;
  readonly conflicts: readonly string[];
  readonly onlyMerge: boolean;
}

interface MergeResult {
  readonly conflicts: readonly string[];
  readonly tree: string;
}

const mergeConfig = [
  '-c',
  'merge.conflictStyle=zdiff3',
  '-c',
  'core.abbrev=12',
  '-c',
  'rerere.enabled=false',
  '-c',
  'core.hooksPath=/dev/null',
  '-c',
  'commit.gpgsign=false',
  '-c',
  'user.name=fix-issue',
  '-c',
  'user.email=fix-issue@users.noreply.github.com',
];
const conflictMarkerPattern = /^(<{7}|>{7}) /m;
const toolingPaths = ['tools', '.github/prompts'];
const cleanMerge = 0;
const conflictedMerge = 1;

function splitNul(output: string): string[] {
  return output.split('\0').filter(entry => entry !== '');
}

function hasCommit(root: string, sha: string): boolean {
  return runCommand('git', ['cat-file', '-e', `${sha}^{commit}`], { cwd: root }).status === 0;
}

export function ensureCommit(root: string, sha: string): void {
  if (hasCommit(root, sha)) return;
  runOrThrow('git', ['fetch', '--quiet', 'origin', sha], { cwd: root });
  if (!hasCommit(root, sha)) throw new Error(`commit ${sha} is not in the repository`);
}

export function isAncestor(root: string, ancestor: string, descendant: string): boolean {
  return (
    runCommand('git', ['merge-base', '--is-ancestor', ancestor, descendant], { cwd: root })
      .status === 0
  );
}

export function mergeBase(root: string, first: string, second: string): string {
  return runOrThrow('git', ['merge-base', first, second], { cwd: root }).trim();
}

export function conflictingPaths(root: string, head: string, dev: string): string[] {
  const result = runCommand(
    'git',
    [...mergeConfig, 'merge-tree', '--write-tree', '--name-only', '--no-messages', '-z', head, dev],
    { cwd: root }
  );
  if (result.status === cleanMerge) return [];
  if (result.status !== conflictedMerge) {
    throw new Error(`git merge-tree ${head} ${dev} failed: ${result.stderr.trim()}`);
  }
  return splitNul(result.stdout).slice(1);
}

function toolingBehind(root: string, head: string, dev: string): boolean {
  const since = mergeBase(root, head, dev);
  return (
    runCommand('git', ['diff', '--quiet', since, dev, '--', ...toolingPaths], { cwd: root })
      .status !== cleanMerge
  );
}

export function planMerge(root: string, head: string, dev: string, requested: boolean): MergePlan {
  if (isAncestor(root, dev, head)) return { merge: false, conflicts: [], onlyMerge: false };
  const conflicts = conflictingPaths(root, head, dev);
  const asked = requested || conflicts.length > 0;
  return { merge: asked || toolingBehind(root, head, dev), conflicts, onlyMerge: asked };
}

function unmergedPaths(root: string): string[] {
  return splitNul(
    runOrThrow('git', ['diff', '--name-only', '--diff-filter=U', '-z'], { cwd: root })
  );
}

export function mergeDev(root: string, dev: string): MergeResult {
  if (isAncestor(root, dev, 'HEAD')) throw new Error(`${dev} is already part of the branch`);
  const merge = runCommand('git', [...mergeConfig, 'merge', '--no-ff', '--no-commit', dev], {
    cwd: root,
  });
  const conflicts = unmergedPaths(root);
  if (merge.status !== cleanMerge && conflicts.length === 0) {
    throw new Error(`git merge ${dev} failed: ${`${merge.stdout}${merge.stderr}`.trim()}`);
  }
  runOrThrow('git', ['add', '-A'], { cwd: root });
  runOrThrow(
    'git',
    [...mergeConfig, 'commit', '--no-verify', '--quiet', '--allow-empty', '-m', `Merge ${dev}`],
    { cwd: root }
  );
  return {
    conflicts,
    tree: runOrThrow('git', ['rev-parse', 'HEAD^{tree}'], { cwd: root }).trim(),
  };
}

function isRegularFile(file: string): boolean {
  try {
    return lstatSync(file).isFile();
  } catch {
    return false;
  }
}

export function filesWithConflictMarkers(root: string, files: readonly string[]): string[] {
  return files.filter(file => {
    const full = path.join(root, file);
    return isRegularFile(full) && conflictMarkerPattern.test(readFileSync(full, 'utf8'));
  });
}
