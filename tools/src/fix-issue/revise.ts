import { writeFileSync } from 'node:fs';

import { runOrThrow } from '../ci/exec.js';
import { mergeBase, mergeDev } from './merge.js';
import type { FixIssuePaths } from './paths.js';
import { type ReviseState, writeReviseState } from './revise-state.js';

export function startRevise(paths: FixIssuePaths, state: ReviseState): ReviseState {
  runOrThrow('git', ['checkout', '--quiet', '--detach', state.head], { cwd: paths.root });
  const conflicts = state.merge ? mergeDev(paths.root, state.dev) : [];
  const since = mergeBase(paths.root, 'HEAD', state.dev);
  writeFileSync(
    paths.pullRequestDiff,
    runOrThrow('git', ['diff', '--no-renames', since, 'HEAD'], { cwd: paths.root })
  );
  const started: ReviseState = { ...state, conflicts, since };
  writeReviseState(paths.reviseFile, started);
  return started;
}
