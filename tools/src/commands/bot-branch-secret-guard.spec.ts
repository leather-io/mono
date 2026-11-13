import { Command } from 'commander';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { getMonorepoRoot } from '../utils/paths.js';
import { registerBotBranchSecretGuardCommands } from './bot-branch-secret-guard.js';

function check(args: readonly string[] = []) {
  const root = new Command().exitOverride();
  registerBotBranchSecretGuardCommands(root);
  return root.parseAsync(['bot-branch-secret-guard', 'check', ...args], { from: 'user' });
}

describe('bot-branch-secret-guard check', () => {
  let scratch: string;
  let logs: string[];
  let errors: string[];

  beforeEach(() => {
    scratch = mkdtempSync(path.join(tmpdir(), 'bot-branch-secret-guard-'));
    logs = [];
    errors = [];
    vi.spyOn(console, 'log').mockImplementation((line: string) => logs.push(line));
    vi.spyOn(console, 'error').mockImplementation((line: string) => errors.push(line));
  });
  afterEach(() => {
    rmSync(scratch, { recursive: true, force: true });
    vi.restoreAllMocks();
    process.exitCode = undefined;
  });

  function baselineOption(baseline: unknown): string[] {
    const file = path.join(scratch, 'baseline.json');
    writeFileSync(file, JSON.stringify(baseline));
    return ['--baseline', path.relative(getMonorepoRoot(), file)];
  }

  test("passes on this repository's workflows with the committed baseline", async () => {
    await check();
    expect(errors).toEqual([]);
    expect(logs.join('\n')).toMatch(/bot-branch-secret-guard: ok \(\d+ baseline jobs?\)$/);
    expect(process.exitCode).toBeUndefined();
  });

  test('fails when the baseline lists a job that does not need to be there', async () => {
    await check(baselineOption({ 'repo:code-checks.yml': ['no-such-job'] }));
    const report = errors.join('\n');
    expect(report).toContain(
      'error: repo:code-checks.yml job "no-such-job" is in the baseline but no longer needs to be; remove it.'
    );
    expect(report).toMatch(/bot-branch-secret-guard: failed$/);
    expect(logs).toEqual([]);
    expect(process.exitCode).toBe(1);
  });

  test('refuses a baseline that is not a list of jobs per workflow', async () => {
    await expect(
      check(baselineOption({ 'repo:code-checks.yml': 'test-coverage' }))
    ).rejects.toThrow(/expected array/);
  });
});
