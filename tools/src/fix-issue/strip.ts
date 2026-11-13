import { rmSync } from 'node:fs';
import path from 'node:path';

import { runCommand, runOrThrow } from '../ci/exec.js';
import { changedPaths, refusedPaths } from './git.js';
import type { FixIssuePaths } from './paths.js';
import { readStatus, writeStatus } from './status.js';

const maxListedPaths = 10;

function describePaths(files: readonly string[]): string {
  const listed = files.slice(0, maxListedPaths).map(file => `\`${file}\``);
  const rest = files.length - listed.length;
  return rest > 0 ? `${listed.join(', ')} and ${rest} more` : listed.join(', ');
}

export function strippedQuestion(files: readonly string[]): string {
  return `The fixer changed ${describePaths(files)}, which fix-issue may never change. They were removed from this pull request. If the issue did not ask for them, treat this run as suspect; otherwise make those changes by hand.`;
}

function isTracked(root: string, file: string): boolean {
  return runCommand('git', ['cat-file', '-e', `HEAD:${file}`], { cwd: root }).status === 0;
}

export function stripForbiddenPaths(paths: FixIssuePaths): string[] {
  const forbidden = refusedPaths(changedPaths(paths.root).map(change => change.path));
  if (forbidden.length === 0) return [];
  const status = readStatus(paths.statusFile);
  if (!status.ok) {
    throw new Error(`the fixer status is not valid:\n  ${status.problems.join('\n  ')}`);
  }
  for (const file of forbidden) {
    if (isTracked(paths.root, file)) {
      runOrThrow('git', ['restore', '--source=HEAD', '--staged', '--worktree', '--', file], {
        cwd: paths.root,
      });
    } else {
      rmSync(path.join(paths.root, file), { recursive: true, force: true });
    }
  }
  writeStatus(paths.statusFile, {
    ...status.status,
    state: 'blocked',
    questions: [...status.status.questions, strippedQuestion(forbidden)],
  });
  return forbidden;
}
