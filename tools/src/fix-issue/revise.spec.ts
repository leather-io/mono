import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { type ReviseState, readReviseState } from './revise-state.js';
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

  function prepare(conflict: boolean, merge: boolean): ReviseState {
    const { head, dev } = createPullRequestBranch(repo, { conflict });
    return {
      pullRequest: 7,
      head,
      dev,
      ordinal: 1,
      merge,
      conflicts: conflict ? [conflictingFile] : [],
      items: ['instructions'],
    };
  }

  test('moves from dev to the pull request head and writes its diff against dev', () => {
    const state = prepare(false, false);
    expect(startRevise(repo.paths, state)).toEqual({ ...state, since: repo.head });
    expect(repo.git(['rev-parse', 'HEAD'])).toBe(state.head);
    expect(readReviseState(repo.paths.reviseFile)).toEqual({ ...state, since: repo.head });
    const diff = readFileSync(repo.paths.pullRequestDiff, 'utf8');
    expect(diff).toContain('-export const feeRow = 1;\n+export const feeRow = 2;');
    expect(diff).not.toContain('newer readme');
  });

  test('merges dev when the gate asked for it and checks from dev on', () => {
    const state = prepare(true, true);
    expect(startRevise(repo.paths, state)).toMatchObject({
      since: state.dev,
      conflicts: [conflictingFile],
    });
    expect(repo.git(['rev-parse', 'HEAD^1', 'HEAD^2']).split('\n')).toEqual([
      state.head,
      state.dev,
    ]);
    expect(readFileSync(repo.paths.pullRequestDiff, 'utf8')).toContain('+<<<<<<< HEAD');
    expect(repo.git(['status', '--porcelain'])).toBe('');
  });
});
