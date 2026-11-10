import { writeFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { verifyRound } from './rounds.js';
import { decideStop, maxStopBlocks, resetStopGuards } from './stop-guard.js';
import {
  type TestRepo,
  blockedStatus,
  createTestRepo,
  doneStatus,
  fakePnpm,
} from './test/test-repo.js';

const cleanReview = { blocking: [], minor: [] };

describe('decideStop', () => {
  let repo: TestRepo;
  beforeEach(() => {
    repo = createTestRepo();
  });
  afterEach(() => repo.cleanup());

  test('lets the fixer stop once its status is valid', () => {
    repo.writeStatus(doneStatus);
    expect(decideStop(repo.paths, 'status')).toBeNull();
  });

  test('lets a blocked fixer stop, since a blocked status is a valid status', () => {
    repo.writeStatus(blockedStatus);
    expect(decideStop(repo.paths, 'status')).toBeNull();
  });

  test('keeps the fixer working while its status is missing, and says why', () => {
    const block = decideStop(repo.paths, 'status');
    expect(block?.decision).toBe('block');
    expect(block?.reason).toMatch(/tmp\/fix-issue\/status\.json does not exist yet/);
    expect(block?.reason).toMatch(/never notified when a background command or sub-agent/);
  });

  test('keeps the fixer working while its status is invalid, naming the problem', () => {
    repo.writeStatus({ ...doneStatus, commit: '' });
    expect(decideStop(repo.paths, 'status')?.reason).toMatch(/is not valid yet \(commit: /);
  });

  test('keeps the reviewer working until review.json is valid', () => {
    expect(decideStop(repo.paths, 'review')?.reason).toMatch(/review\.json does not exist yet/);
    writeFileSync(repo.paths.reviewFile, '{ blocking');
    expect(decideStop(repo.paths, 'review')?.reason).toMatch(/is not valid yet/);
    writeFileSync(repo.paths.reviewFile, JSON.stringify(cleanReview));
    expect(decideStop(repo.paths, 'review')).toBeNull();
  });

  test(`gives up after ${maxStopBlocks} blocks so a stuck agent cannot loop forever`, () => {
    for (let block = 0; block < maxStopBlocks; block++) {
      expect(decideStop(repo.paths, 'review')).not.toBeNull();
    }
    expect(decideStop(repo.paths, 'review')).toBeNull();
  });

  test('counts the fixer and the reviewer separately', () => {
    for (let block = 0; block < maxStopBlocks; block++) decideStop(repo.paths, 'status');
    expect(decideStop(repo.paths, 'review')).not.toBeNull();
  });

  test('a new round starts with a fresh allowance', () => {
    for (let block = 0; block < maxStopBlocks; block++) decideStop(repo.paths, 'review');
    verifyRound(repo.paths, 2, fakePnpm(repo).run);
    expect(decideStop(repo.paths, 'review')).not.toBeNull();
    resetStopGuards(repo.paths);
    expect(decideStop(repo.paths, 'review')).not.toBeNull();
  });
});
