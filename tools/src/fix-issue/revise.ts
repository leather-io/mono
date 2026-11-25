import { writeFileSync } from 'node:fs';

import { runOrThrow } from '../ci/exec.js';
import { mergeBase, mergeDev } from './merge.js';
import type { FixIssuePaths } from './paths.js';
import type { GatedRevise } from './revise-gate.js';
import { type ReviseState, writeReviseState } from './revise-state.js';

export function startRevise(paths: FixIssuePaths, gated: GatedRevise, dev: string): ReviseState {
  runOrThrow('git', ['checkout', '--quiet', '--detach', gated.head], { cwd: paths.root });
  const conflicts = gated.merge ? mergeDev(paths.root, dev) : [];
  const since = mergeBase(paths.root, 'HEAD', dev);
  writeFileSync(
    paths.pullRequestDiff,
    runOrThrow('git', ['diff', '--no-renames', since, 'HEAD'], { cwd: paths.root })
  );
  const started: ReviseState = {
    head: gated.head,
    merge: gated.merge,
    conflicts,
    items: [...gated.items],
    since,
  };
  writeReviseState(paths.reviseFile, started);
  return started;
}
