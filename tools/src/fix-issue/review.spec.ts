import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { readReview } from './review.js';

const finding = {
  kind: 'blocker',
  location: 'apps/extension/fee-row.tsx:1',
  defect: 'hides the fee',
  scenario: 'a narrow popup',
};

describe('readReview', () => {
  let file: string;
  beforeEach(() => {
    file = path.join(mkdtempSync(path.join(tmpdir(), 'fix-issue-review-')), 'review.json');
  });
  afterEach(() => rmSync(path.dirname(file), { recursive: true, force: true }));

  function write(content: unknown) {
    writeFileSync(file, typeof content === 'string' ? content : JSON.stringify(content));
  }

  test('reads blocking and minor findings', () => {
    write({ blocking: [finding], minor: [{ location: 'a.ts:2', note: 'name it' }] });
    expect(readReview(file)).toEqual({
      blocking: [finding],
      minor: [{ location: 'a.ts:2', note: 'name it' }],
    });
  });

  test('treats missing minor findings as none', () => {
    write({ blocking: [] });
    expect(readReview(file)).toEqual({ blocking: [], minor: [] });
  });

  test('refuses a missing file', () => {
    expect(() => readReview(file)).toThrow(/does not exist/);
  });

  test('refuses invalid JSON', () => {
    write('{ blocking');
    expect(() => readReview(file)).toThrow(/is not valid JSON/);
  });

  test('names each problem of an invalid review', () => {
    write({ blocking: [{ ...finding, kind: 'nit', defect: ' ' }] });
    expect(() => readReview(file)).toThrow(
      /is not a valid review:\n {2}blocking\.0\.kind: .*\n {2}blocking\.0\.defect: is empty/
    );
  });
});
