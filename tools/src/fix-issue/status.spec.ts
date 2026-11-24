import { writeFileSync } from 'node:fs';
import { afterEach, describe, expect, test } from 'vitest';

import { closesNumbers, parseStatus, readState, readStatus, subjectProblem } from './status.js';
import { type TestRepo, blockedStatus, createTestRepo, doneStatus } from './test/test-repo.js';

describe('parseStatus', () => {
  test('accepts a done status', () => {
    expect(parseStatus(doneStatus)).toEqual({ ok: true, status: doneStatus });
  });

  test('fills omitted lists with empty ones', () => {
    const result = parseStatus({
      state: 'blocked',
      commit: doneStatus.commit,
      questions: ['Which option?'],
    });
    expect(result.ok && result.status.screenshots).toEqual([]);
  });

  test('requires why, how and tested when done', () => {
    const result = parseStatus({ ...doneStatus, how: [] });
    expect(result).toEqual({ ok: false, problems: ['how: has no entries'] });
  });

  test('requires questions when blocked', () => {
    const result = parseStatus({ ...blockedStatus, questions: [] });
    expect(result).toEqual({ ok: false, problems: ['questions: has no entries'] });
  });

  test('lets a blocked status hand changes off instead of asking questions', () => {
    const result = parseStatus({
      ...blockedStatus,
      questions: [],
      handoff: [{ path: 'knip.json', change: 'add the web feature-map sources as entries' }],
    });
    expect(result.ok).toBe(true);
  });

  test.each([
    ['apps/web/app/routes.ts', 'is a path this run may change'],
    ['/knip.json', 'must be a repo-relative path'],
    ['apps/../knip.json', 'must be a repo-relative path'],
  ])('refuses a handoff for %s', (path, message) => {
    const result = parseStatus({ ...doneStatus, handoff: [{ path, change: 'edit it' }] });
    expect(result.ok === false && result.problems.join(' ')).toMatch(message);
  });

  test('refuses an unknown state', () => {
    const result = parseStatus({ ...doneStatus, state: 'staged' });
    expect(result.ok).toBe(false);
  });

  test('refuses a multi-line bullet', () => {
    const result = parseStatus({ ...doneStatus, why: ['one\ntwo'] });
    expect(result).toEqual({ ok: false, problems: ['why.0: must be a single line'] });
  });

  test('refuses a screenshot id that is not lowercase and hyphenated', () => {
    const result = parseStatus({ ...doneStatus, screenshots: [{ id: '../escape', caption: 'x' }] });
    expect(result).toEqual({
      ok: false,
      problems: ['screenshots.0.id: must be lowercase and hyphenated'],
    });
  });

  test('takes one answer per feedback item of a revise', () => {
    const feedback = [
      { id: 'instructions', addressed: true, reply: 'Wrapped the label.' },
      { id: 'thread-2187654321', addressed: false, reply: 'Kept the name the brief settles.' },
    ];
    const result = parseStatus({ ...doneStatus, feedback });
    expect(result.ok && result.status.feedback).toEqual(feedback);
  });

  test.each([
    [{ id: 'Thread 11', addressed: true, reply: 'Done.' }, 'feedback.0.id: must be an id'],
    [
      { id: 'thread-11', addressed: true, reply: 'one\ntwo' },
      'feedback.0.reply: must be a single line',
    ],
    [{ id: 'thread-11', reply: 'Done.' }, 'feedback.0.addressed'],
  ])('refuses a feedback answer that is not in shape', (entry, message) => {
    const result = parseStatus({ ...doneStatus, feedback: [entry] });
    expect(result.ok === false && result.problems.join(' ')).toContain(message);
  });

  test('refuses more than 12 screenshots', () => {
    const screenshots = Array.from({ length: 13 }, (_, index) => ({
      id: `state-${index}`,
      caption: 'x',
    }));
    expect(parseStatus({ ...doneStatus, screenshots }).ok).toBe(false);
  });
});

describe('subjectProblem', () => {
  test.each([
    ['fix(extension): keep the fee row visible', null],
    ['', 'commit: is empty'],
    ['fix: keep the fee row visible', /not a conventional subject with a scope/],
    ['fix(extension): close #12', /names an issue number/],
    [`fix(extension): ${'a'.repeat(100)}`, /longer than 100 characters/],
  ])('%s', (subject, expected) => {
    const problem = subjectProblem(subject);
    if (expected === null) expect(problem).toBeNull();
    else if (typeof expected === 'string') expect(problem).toBe(expected);
    else expect(problem).toMatch(expected);
  });
});

describe('closesNumbers', () => {
  test('puts the dispatched issue first and drops duplicates', () => {
    expect(closesNumbers({ ...doneStatus, closes: [14, 12, 14] }, 12)).toEqual([12, 14]);
  });
});

describe('reading the status file', () => {
  let repo: TestRepo;
  afterEach(() => repo.cleanup());

  test('reports a missing file', () => {
    repo = createTestRepo();
    expect(readStatus(repo.paths.statusFile)).toEqual({
      ok: false,
      problems: [`${repo.paths.statusFile} does not exist`],
    });
    expect(readState(repo.paths.statusFile)).toBeNull();
  });

  test('reports invalid JSON', () => {
    repo = createTestRepo();
    writeFileSync(repo.paths.statusFile, '{ state: done');
    const result = readStatus(repo.paths.statusFile);
    expect(result.ok === false && result.problems[0]).toMatch(/is not valid JSON/);
  });

  test('still reads the state of an otherwise invalid status', () => {
    repo = createTestRepo();
    repo.writeStatus({ state: 'blocked' });
    expect(readStatus(repo.paths.statusFile).ok).toBe(false);
    expect(readState(repo.paths.statusFile)).toBe('blocked');
  });
});
