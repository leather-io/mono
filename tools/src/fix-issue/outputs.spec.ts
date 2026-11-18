import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { writeStepOutputs } from './outputs.js';

describe('writeStepOutputs', () => {
  let dir: string;
  beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), 'fix-issue-outputs-'));
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  test('appends one key=value line per output', () => {
    const file = path.join(dir, 'output');
    writeFileSync(file, 'earlier=1\n');
    writeStepOutputs({ continue: true, round: 2, state: 'done' }, file);
    expect(readFileSync(file, 'utf8')).toBe('earlier=1\ncontinue=true\nround=2\nstate=done\n');
  });

  test('does nothing outside a workflow run', () => {
    expect(() => writeStepOutputs({ continue: false }, undefined)).not.toThrow();
  });
});
