import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { checkReview, endRound, finishRounds, parseRound, verifyRound } from './rounds.js';
import { readStatus } from './status.js';
import {
  type TestRepo,
  blockedStatus,
  createTestRepo,
  doneStatus,
  fakePnpm,
} from './test/test-repo.js';

const cleanReview = {
  blocking: [],
  minor: [{ location: 'apps/extension/fee-row.tsx:1', note: 'name the constant' }],
};
const blockingReview = {
  blocking: [
    {
      kind: 'critical',
      location: 'apps/extension/fee-row.tsx:1',
      defect: 'leaks the address',
      scenario: 'any log call',
    },
    {
      kind: 'regression',
      location: 'apps/extension/fee-row.tsx:1',
      defect: 'breaks the old row',
      scenario: 'a narrow popup',
    },
  ],
  minor: [],
};

const handoffStatus = {
  ...doneStatus,
  handoff: [
    { path: 'knip.json', change: 'add apps/mobile/tests/*.features.ts to the mobile entry' },
  ],
};

describe('rounds', () => {
  let repo: TestRepo;
  beforeEach(() => {
    repo = createTestRepo();
  });
  afterEach(() => repo.cleanup());

  function writeReview(review: unknown) {
    writeFileSync(repo.paths.reviewFile, JSON.stringify(review));
  }

  function reviewedRound(round: number, review: unknown, fail?: string) {
    if (verifyRound(repo.paths, round, fakePnpm(repo, { fail }).run)) {
      writeReview(review);
      checkReview(repo.paths);
    }
    return endRound(repo.paths, round);
  }

  function roundFile(round: number, name: string) {
    return path.join(repo.paths.roundsDir, String(round), name);
  }

  test("verifying a round clears the last round's review", () => {
    repo.writeStatus(blockedStatus);
    writeReview(cleanReview);
    expect(verifyRound(repo.paths, 2, fakePnpm(repo).run)).toBe(false);
    expect(existsSync(repo.paths.reviewFile)).toBe(false);
  });

  test('a revise that only answers the feedback ends clean without a gate or a review', () => {
    repo.write(
      'tmp/fix-issue/revise.json',
      JSON.stringify({
        pullRequest: 7,
        issue: 12,
        branch: 'bot/fix-issue-12-777',
        head: repo.head,
        dev: repo.head,
        ordinal: 1,
        merge: false,
        conflicts: [],
        items: [{ id: 'thread-11', kind: 'thread' }],
      })
    );
    repo.writeStatus({
      ...doneStatus,
      feedback: [{ id: 'thread-11', addressed: true, reply: 'It already wraps; see line 4.' }],
    });
    const pnpm = fakePnpm(repo);
    expect(verifyRound(repo.paths, 1, pnpm.run)).toBe(false);
    expect(pnpm.calls).toEqual([]);
    expect(endRound(repo.paths, 1)).toEqual({
      outcome: 'clean',
      continue: false,
      summary: 'Round 1: the revise changed nothing and only answers the feedback',
    });
    expect(finishRounds(repo.paths)).toBe('clean');
  });

  test('a round number must be 1 to 9', () => {
    expect(parseRound('3')).toBe(3);
    expect(() => parseRound('x')).toThrow("'x' is not a round number from 1 to 9");
  });

  test('a round is clean when the gate passes and the review finds nothing blocking', () => {
    repo.makeFix();
    repo.writeStatus(doneStatus);
    expect(reviewedRound(1, cleanReview)).toMatchObject({
      outcome: 'clean',
      continue: false,
    });
    expect(existsSync(roundFile(1, 'review.json'))).toBe(true);
  });

  test('a failed gate continues to the next round without a review', () => {
    repo.makeFix();
    repo.writeStatus(doneStatus);
    expect(reviewedRound(1, cleanReview, 'lint')).toEqual({
      outcome: 'failed',
      continue: true,
      summary: 'Round 1: `pnpm lint` failed',
    });
    expect(readFileSync(roundFile(1, 'verify.md'), 'utf8')).toMatch(/^FAILED: `pnpm lint` failed/);
    expect(existsSync(roundFile(1, 'review.json'))).toBe(false);
  });

  test('a failed gate stops the rounds while handoffs wait on a maintainer', () => {
    repo.makeFix();
    repo.writeStatus(handoffStatus);
    expect(reviewedRound(1, cleanReview, 'knip')).toEqual({
      outcome: 'failed',
      continue: false,
      summary: 'Round 1: `pnpm knip` failed',
    });
    expect(finishRounds(repo.paths)).toBe('failed');
    const status = readStatus(repo.paths.statusFile);
    expect(status.ok && status.status.state).toBe('blocked');
    expect(status.ok && status.status.questions).toEqual([
      '`pnpm knip` failed in round 1 while the changes to `knip.json` still wait on a maintainer, so no further round ran. Options: make those changes on this branch and check the failure is gone; dispatch again with guidance in the brief if it stays.',
    ]);
  });

  test('blocking review findings continue to the next round even while handoffs wait', () => {
    repo.makeFix();
    repo.writeStatus(handoffStatus);
    expect(reviewedRound(1, blockingReview)).toMatchObject({ outcome: 'failed', continue: true });
  });

  test('blocking review findings continue to the next round', () => {
    repo.makeFix();
    repo.writeStatus(doneStatus);
    expect(reviewedRound(1, blockingReview)).toMatchObject({
      outcome: 'failed',
      summary: 'Round 1: review found 2 critical, blocker or regression findings',
    });
  });

  test('a blocked fixer stops the rounds', () => {
    repo.writeStatus(blockedStatus);
    verifyRound(repo.paths, 1, fakePnpm(repo).run);
    expect(endRound(repo.paths, 1)).toMatchObject({ outcome: 'blocked', continue: false });
  });

  test('a blocked fixer with no changes skips the gate and the review', () => {
    repo.writeStatus(blockedStatus);
    expect(verifyRound(repo.paths, 1, fakePnpm(repo).run)).toBe(false);
    expect(endRound(repo.paths, 1)).toMatchObject({
      outcome: 'blocked',
      summary: 'Round 1: the fixer stopped as blocked',
    });
  });

  test('a blocked fixer with changes is verified and reviewed, then stops the rounds', () => {
    repo.makeFix();
    repo.writeStatus(blockedStatus);
    expect(reviewedRound(1, cleanReview)).toEqual({
      outcome: 'blocked',
      continue: false,
      summary:
        'Round 1: the fixer stopped as blocked; checks passed and review found no critical, blocker or regression findings',
    });
  });

  test('a blocked fixer whose changes fail the gate records the failure', () => {
    repo.makeFix();
    repo.writeStatus(blockedStatus);
    expect(reviewedRound(1, cleanReview, 'lint')).toMatchObject({
      outcome: 'blocked',
      summary: 'Round 1: the fixer stopped as blocked; `pnpm lint` failed',
    });
    expect(existsSync(roundFile(1, 'review.json'))).toBe(false);
  });

  test('a review that changes a file fails the run', () => {
    repo.makeFix();
    repo.writeStatus(doneStatus);
    expect(verifyRound(repo.paths, 1, fakePnpm(repo).run)).toBe(true);
    repo.write('packages/utils/extra.ts', 'export const extra = 1;\n');
    writeReview(cleanReview);
    expect(() => checkReview(repo.paths)).toThrow(/the review changed files/);
  });

  test.each([
    ['a missing review file', null, 'the review ended without writing its review file'],
    [
      'an unknown finding kind',
      { blocking: [{ ...blockingReview.blocking[0], kind: 'nit' }] },
      'the review wrote an invalid review file',
    ],
    ['invalid JSON', '{ blocking', 'the review wrote an invalid review file'],
  ])('a round with %s fails and continues instead of failing the run', (_name, review, reason) => {
    repo.makeFix();
    repo.writeStatus(doneStatus);
    expect(verifyRound(repo.paths, 1, fakePnpm(repo).run)).toBe(true);
    if (typeof review === 'string') writeFileSync(repo.paths.reviewFile, review);
    else if (review !== null) writeReview(review);
    expect(checkReview(repo.paths)).toBeNull();
    expect(endRound(repo.paths, 1)).toEqual({
      outcome: 'failed',
      continue: true,
      summary: `Round 1: ${reason}`,
    });
  });

  test('a run whose last review never wrote its file ends blocked with a question', () => {
    repo.makeFix();
    repo.writeStatus(doneStatus);
    for (const round of [1, 2, 3]) {
      verifyRound(repo.paths, round, fakePnpm(repo).run);
      checkReview(repo.paths);
      endRound(repo.paths, round);
    }
    expect(finishRounds(repo.paths)).toBe('failed');
    const status = readStatus(repo.paths.statusFile);
    expect(status.ok && status.status.state).toBe('blocked');
    expect(status.ok && status.status.questions).toEqual([
      'The fix still fails after 3 rounds (the review ended without writing its review file). Options: dispatch again with guidance in the brief; take the branch over locally.',
    ]);
  });

  test('a blocked fixer whose review never wrote its file still stops the rounds', () => {
    repo.makeFix();
    repo.writeStatus(blockedStatus);
    verifyRound(repo.paths, 1, fakePnpm(repo).run);
    expect(endRound(repo.paths, 1)).toMatchObject({
      outcome: 'blocked',
      summary:
        'Round 1: the fixer stopped as blocked; the review ended without writing its review file',
    });
  });

  test('finishing a clean run records every round under tested', () => {
    repo.makeFix();
    repo.writeStatus(doneStatus);
    reviewedRound(1, cleanReview, 'lint');
    reviewedRound(2, cleanReview);
    expect(finishRounds(repo.paths)).toBe('clean');
    const status = readStatus(repo.paths.statusFile);
    expect(status.ok && status.status.state).toBe('done');
    expect(status.ok && status.status.tested).toEqual([
      'Round 1: `pnpm lint` failed',
      'Round 2: checks passed and review found no critical, blocker or regression findings',
      ...doneStatus.tested,
    ]);
  });

  test('a run that still fails after its last round becomes blocked with a question', () => {
    repo.makeFix();
    repo.writeStatus(doneStatus);
    for (const round of [1, 2, 3]) reviewedRound(round, blockingReview);
    expect(finishRounds(repo.paths)).toBe('failed');
    const status = readStatus(repo.paths.statusFile);
    expect(status.ok && status.status.state).toBe('blocked');
    expect(status.ok && status.status.questions).toEqual([
      'The fix still fails after 3 rounds (review found 2 critical, blocker or regression findings). Options: dispatch again with guidance in the brief; take the branch over locally.',
    ]);
  });

  test('a blocked fixer keeps its questions', () => {
    repo.writeStatus(blockedStatus);
    verifyRound(repo.paths, 1, fakePnpm(repo).run);
    endRound(repo.paths, 1);
    expect(finishRounds(repo.paths)).toBe('blocked');
    const status = readStatus(repo.paths.statusFile);
    expect(status.ok && status.status.questions).toEqual(blockedStatus.questions);
    expect(status.ok && status.status.tested).toEqual(['Round 1: the fixer stopped as blocked']);
  });

  test('a blocked fixer with blocking review findings asks about them', () => {
    repo.makeFix();
    repo.writeStatus(blockedStatus);
    reviewedRound(1, blockingReview);
    expect(finishRounds(repo.paths)).toBe('blocked');
    const status = readStatus(repo.paths.statusFile);
    expect(status.ok && status.status.questions).toEqual([
      ...blockedStatus.questions,
      'The review found 2 critical, blocker or regression findings that no round fixed because the fixer stopped as blocked: critical at apps/extension/fee-row.tsx:1: leaks the address; regression at apps/extension/fee-row.tsx:1: breaks the old row. Options: answer the questions and dispatch again; fix them on this branch by hand.',
    ]);
  });

  test('review findings that span lines still finish with a valid status', () => {
    repo.makeFix();
    repo.writeStatus(blockedStatus);
    reviewedRound(1, {
      blocking: [
        {
          kind: 'critical',
          location: 'apps/extension/fee-row.tsx:1\nand its caller',
          defect: 'leaks the address:\n- in the log call\n- in the error',
          scenario: 'any log call',
        },
      ],
      minor: [{ location: 'packages/utils/run.sh:1\n', note: 'quote the variable' }],
    });
    expect(finishRounds(repo.paths)).toBe('blocked');
    const status = readStatus(repo.paths.statusFile);
    expect(status.ok && status.status.questions.at(-1)).toContain(
      'critical at apps/extension/fee-row.tsx:1 and its caller: leaks the address: - in the log call - in the error.'
    );
    expect(status.ok && status.status.followUps).toEqual([
      '`packages/utils/run.sh:1`: quote the variable',
    ]);
  });

  test("finishing carries the last review's minor findings into follow-ups", () => {
    repo.makeFix();
    repo.writeStatus({
      ...doneStatus,
      followUps: ['`apps/extension/fee-row.tsx:1`: name the constant'],
    });
    reviewedRound(1, {
      blocking: [],
      minor: [
        { location: 'apps/extension/fee-row.tsx:1', note: 'name the constant' },
        { location: 'packages/utils/run.sh:1', note: 'quote the\nvariable' },
      ],
    });
    finishRounds(repo.paths);
    const status = readStatus(repo.paths.statusFile);
    expect(status.ok && status.status.followUps).toEqual([
      '`apps/extension/fee-row.tsx:1`: name the constant',
      '`packages/utils/run.sh:1`: quote the variable',
    ]);
  });

  test('finishing drops minor findings on files the fixer already named and formats every entry alike', () => {
    repo.makeFix();
    repo.writeStatus({
      ...doneStatus,
      followUps: [
        'apps/extension/fee-row.tsx: the wrap logic is duplicated and could be shared',
        'packages/utils/run.sh:4:   quote the   variable',
        'Consider a lint rule for raw widths',
      ],
    });
    reviewedRound(1, {
      blocking: [],
      minor: [
        {
          location: 'apps/extension/fee-row.tsx:9',
          note: 'The duplicated wrap logic could move to a helper.',
        },
        { location: 'packages/utils/run.sh:1', note: 'quote the variable' },
        { location: 'apps/extension/fee-row.spec.tsx:1', note: 'cover the narrow popup' },
      ],
    });
    finishRounds(repo.paths);
    const status = readStatus(repo.paths.statusFile);
    expect(status.ok && status.status.followUps).toEqual([
      '`apps/extension/fee-row.tsx`: the wrap logic is duplicated and could be shared',
      '`packages/utils/run.sh:4`: quote the variable',
      'Consider a lint rule for raw widths',
      '`apps/extension/fee-row.spec.tsx:1`: cover the narrow popup',
    ]);
  });

  test('finishing caps follow-ups so the status stays valid', () => {
    repo.makeFix();
    repo.writeStatus(doneStatus);
    const minor = Array.from({ length: 30 }, (_, index) => ({
      location: `apps/extension/fee-row.tsx:${index + 1}`,
      note: 'tidy',
    }));
    reviewedRound(1, { blocking: [], minor });
    finishRounds(repo.paths);
    const status = readStatus(repo.paths.statusFile);
    expect(status.ok && status.status.followUps).toHaveLength(20);
  });

  test('finishing fails when no round ran', () => {
    repo.writeStatus(doneStatus);
    expect(() => finishRounds(repo.paths)).toThrow('no round ran');
  });
});
