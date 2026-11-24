import { writeFileSync } from 'node:fs';

import { runOrThrow } from './exec.js';
import { ensureCommit, mergeBase, mergeDev } from './merge.js';
import type { FixIssuePaths } from './paths.js';
import { type ReviseState, readReviseState, writeReviseState } from './revise-state.js';

export function startRevise(paths: FixIssuePaths): ReviseState {
  const state = readReviseState(paths.reviseFile);
  if (state === null) throw new Error(`${paths.reviseFile} does not exist`);
  ensureCommit(paths.root, state.head);
  ensureCommit(paths.root, state.dev);
  runOrThrow('git', ['checkout', '--quiet', '--detach', state.head], { cwd: paths.root });
  const conflicts = state.merge ? mergeDev(paths.root, state.dev).conflicts : [];
  const since = mergeBase(paths.root, 'HEAD', state.dev);
  writeFileSync(
    paths.pullRequestDiff,
    runOrThrow('git', ['diff', '--no-renames', since, 'HEAD'], { cwd: paths.root })
  );
  const started: ReviseState = { ...state, conflicts: [...conflicts], since };
  writeReviseState(paths.reviseFile, started);
  return started;
}
