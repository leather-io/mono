import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import type { GatedRevise } from './revise-gate.js';
import { readReviseState } from './revise-state.js';
import { startRevise } from './revise.js';
import {
  type TestRepo,
  conflictingFile,
  createPullRequestBranch,
  createTestRepo,
} from './test/test-repo.js';

describe('startRevise', () => {
  let repo: TestRepo;

  beforeEach(() => {
    repo = createTestRepo();
  });
  afterEach(() => repo.cleanup());

  function prepare(conflict: boolean, merge: boolean) {
    const { head, dev } = createPullRequestBranch(repo, { conflict });
    const gated: GatedRevise = { head, ordinal: 1, merge, items: ['instructions'] };
    return { gated, dev };
  }

  test('moves from dev to the pull request head and writes its diff against dev', () => {
    const { gated, dev } = prepare(false, false);
    const started = { head: gated.head, merge: false, conflicts: [], items: gated.items };
    expect(startRevise(repo.paths, gated, dev)).toEqual({ ...started, since: repo.head });
    expect(repo.git(['rev-parse', 'HEAD'])).toBe(gated.head);
    expect(readReviseState(repo.paths.reviseFile)).toEqual({ ...started, since: repo.head });
    const diff = readFileSync(repo.paths.pullRequestDiff, 'utf8');
    expect(diff).toContain('-export const feeRow = 1;\n+export const feeRow = 2;');
    expect(diff).not.toContain('newer readme');
  });

  test('merges dev when the gate asked for it and checks from dev on', () => {
    const { gated, dev } = prepare(true, true);
    expect(startRevise(repo.paths, gated, dev)).toMatchObject({
      since: dev,
      conflicts: [conflictingFile],
    });
    expect(repo.git(['rev-parse', 'HEAD^1', 'HEAD^2']).split('\n')).toEqual([gated.head, dev]);
    expect(readFileSync(repo.paths.pullRequestDiff, 'utf8')).toContain('+<<<<<<< HEAD');
    expect(repo.git(['status', '--porcelain'])).toBe('');
  });
});
