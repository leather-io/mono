import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import {
  type ReviseState,
  isReviseSummary,
  issueOfBranch,
  readReviseState,
  reviseMarker,
} from './revise-state.js';
import { type TestRepo, createTestRepo } from './test/test-repo.js';

const state: ReviseState = {
  head: 'a'.repeat(40),
  merge: true,
  conflicts: ['apps/extension/fee-row.tsx'],
  since: 'b'.repeat(40),
};

describe('revise state', () => {
  let repo: TestRepo;
  beforeEach(() => {
    repo = createTestRepo();
  });
  afterEach(() => repo.cleanup());

  test('refuses a file that is not a revise state', () => {
    repo.write('tmp/fix-issue/revise.json', JSON.stringify({ ...state, conflicts: [{ id: 'x' }] }));
    expect(() => readReviseState(repo.paths.reviseFile)).toThrow();
  });
});

describe('issueOfBranch', () => {
  test('takes the issue from a fix-issue run branch and from nothing else', () => {
    expect(issueOfBranch('bot/fix-issue-12-777')).toBe(12);
    expect(issueOfBranch('bot/fix-issue-12-by-hand')).toBeNull();
    expect(issueOfBranch('bot/fix-issue-0-777')).toBeNull();
    expect(issueOfBranch('bot/screenshots-12')).toBeNull();
    expect(issueOfBranch('feat/bot/fix-issue-12-777')).toBeNull();
  });
});

describe('revise marker', () => {
  test('marks the summary comment of a revise', () => {
    const marker = reviseMarker(2);
    expect(marker).toBe('<!-- fix-issue:revise 2 -->');
    expect(isReviseSummary(`${marker}\n**Revise 2 of 5**`)).toBe(true);
  });

  test('is read only from the start of a comment', () => {
    expect(isReviseSummary(null)).toBe(false);
    expect(isReviseSummary('Quoting: <!-- fix-issue:revise 2 -->')).toBe(false);
    expect(isReviseSummary('<!-- fix-issue:brief -->')).toBe(false);
  });
});
