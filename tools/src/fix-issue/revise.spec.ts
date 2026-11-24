import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { type ReviseState, readReviseState, writeReviseState } from './revise-state.js';
import { startRevise } from './revise.js';
import {
  type TestRepo,
  conflictingFile,
  createPullRequestBranch,
  createTestRepo,
  pullRequestBranch,
} from './test/test-repo.js';

describe('startRevise', () => {
  let repo: TestRepo;

  beforeEach(() => {
    repo = createTestRepo();
  });
  afterEach(() => repo.cleanup());

  function prepare(conflict: boolean, merge: boolean): ReviseState {
    const { head, dev } = createPullRequestBranch(repo, { conflict });
    const state: ReviseState = {
      pullRequest: 7,
      issue: 12,
      branch: pullRequestBranch,
      head,
      dev,
      ordinal: 1,
      merge,
      conflicts: conflict ? [conflictingFile] : [],
      items: [{ id: 'instructions', kind: 'instructions' }],
    };
    writeReviseState(repo.paths.reviseFile, state);
    return state;
  }

  test('moves from dev to the pull request head and writes its diff against dev', () => {
    const state = prepare(false, false);
    expect(startRevise(repo.paths)).toEqual({ ...state, since: repo.head });
    expect(repo.git(['rev-parse', 'HEAD'])).toBe(state.head);
    expect(readReviseState(repo.paths.reviseFile)).toEqual({ ...state, since: repo.head });
    const diff = readFileSync(repo.paths.pullRequestDiff, 'utf8');
    expect(diff).toContain('-export const feeRow = 1;\n+export const feeRow = 2;');
    expect(diff).not.toContain('newer readme');
  });

  test('merges dev when the gate asked for it and checks from dev on', () => {
    const state = prepare(true, true);
    expect(startRevise(repo.paths)).toMatchObject({
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

  test('refuses to start without the state the gate wrote', () => {
    expect(() => startRevise(repo.paths)).toThrow('revise.json does not exist');
  });

  test('refuses to start on a head that is not in the repository', () => {
    const state = prepare(false, false);
    writeReviseState(repo.paths.reviseFile, { ...state, head: 'f'.repeat(40) });
    expect(() => startRevise(repo.paths)).toThrow(/git fetch --quiet origin f+/);
  });
});
