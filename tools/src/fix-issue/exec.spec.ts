import { tmpdir } from 'node:os';
import { describe, expect, test } from 'vitest';

import { runCommand, runOrThrow } from './exec.js';

const cwd = tmpdir();
const outputScript = "console.log('out'); console.error('err'); process.exit(3)";
const failingScript = "console.error('broke'); process.exit(1)";

describe('runCommand', () => {
  test('returns the status and both output streams', () => {
    expect(runCommand('node', ['-e', outputScript], { cwd })).toEqual({
      status: 3,
      stdout: 'out\n',
      stderr: 'err\n',
    });
  });

  test('passes input on standard input', () => {
    expect(runCommand('cat', [], { cwd, input: 'brief\n' }).stdout).toBe('brief\n');
  });

  test('reports a command that cannot start as a failure', () => {
    const result = runCommand('fix-issue-no-such-command', [], { cwd });
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/ENOENT/);
  });
});

describe('runOrThrow', () => {
  test('returns standard output on success', () => {
    expect(runOrThrow('node', ['-e', "console.log('ok')"], { cwd })).toBe('ok\n');
  });

  test('throws with the command and its standard error on failure', () => {
    expect(() => runOrThrow('node', ['-e', failingScript], { cwd })).toThrow(
      `node -e ${failingScript} failed: broke`
    );
  });
});
