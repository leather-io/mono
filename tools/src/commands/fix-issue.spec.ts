import { Command } from 'commander';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { registerFixIssueCommands } from './fix-issue.js';

function program() {
  const root = new Command().exitOverride();
  registerFixIssueCommands(root);
  return root;
}

describe('fix-issue commands', () => {
  let runDir: string;
  let errors: string[];
  beforeEach(() => {
    runDir = mkdtempSync(path.join(tmpdir(), 'fix-issue-cli-'));
    errors = [];
    vi.spyOn(console, 'error').mockImplementation((line: string) => errors.push(line));
  });
  afterEach(() => {
    rmSync(runDir, { recursive: true, force: true });
    vi.restoreAllMocks();
    process.exitCode = undefined;
  });

  test('registers every workflow step and the local commands', () => {
    const fixIssue = program().commands.find(command => command.name() === 'fix-issue');
    expect(fixIssue?.commands.map(command => command.name())).toEqual([
      'fetch-issue',
      'dispatch',
      'status',
      'verify',
      'round',
      'stop-guard',
      'strip-forbidden',
      'screenshots',
      'open-pull-request',
    ]);
    const round = fixIssue?.commands.find(command => command.name() === 'round');
    expect(round?.commands.map(command => command.name())).toEqual([
      'verify',
      'check-review',
      'end',
      'finish',
    ]);
  });

  test('a step that fails reports its error and sets a failing exit code', async () => {
    await program().parseAsync(
      ['fix-issue', 'dispatch', '--run-dir', runDir, '--issue', 'twelve'],
      { from: 'user' }
    );
    expect(errors).toEqual(["fix-issue-dispatch: 'twelve' is not an issue number"]);
    expect(process.exitCode).toBe(1);
  });

  test('status needs issue numbers or a run directory', async () => {
    await program().parseAsync(['fix-issue', 'status'], { from: 'user' });
    expect(errors).toEqual(['fix-issue-status: pass issue numbers or --run-dir']);
    expect(process.exitCode).toBe(1);
  });

  test('a round number outside 1 to 9 is refused', async () => {
    await program().parseAsync(['fix-issue', 'round', 'end', '--round', '0'], { from: 'user' });
    expect(errors).toEqual(["fix-issue-round: '0' is not a round number from 1 to 9"]);
  });
});
