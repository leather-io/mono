import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { claudeModel, runClaude } from './claude.js';
import type { CommandRunner } from './exec.js';

const schema = { type: 'object' };

function valueAfter(args: readonly string[], flag: string): string | undefined {
  return args[args.indexOf(flag) + 1];
}

describe('runClaude', () => {
  interface RunnerCall {
    readonly command: string;
    readonly args: readonly string[];
    readonly cwd: string;
    readonly input?: string;
  }

  function fakeRunner(result: ReturnType<CommandRunner>) {
    const calls: RunnerCall[] = [];
    function run(
      command: string,
      args: readonly string[],
      { cwd, input }: { readonly cwd: string; readonly input?: string }
    ) {
      calls.push({ command, args, cwd, input });
      return result;
    }
    return { calls, run };
  }

  const answer = JSON.stringify({ is_error: false, structured_output: { reviews: 1 } });

  const options = { systemPromptPath: '/tmp/system.md', schema, prompt: 'classify', cwd: '/tmp' };

  beforeEach(() => {
    vi.stubEnv('CLAUDE_BIN', '/opt/claude');
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('runs the pinned binary with the prompt on standard input and returns its answer', () => {
    const stderr = vi.spyOn(process.stderr, 'write').mockReturnValue(true);
    const runner = fakeRunner({ status: 0, stdout: answer, stderr: 'progress\n' });

    expect(runClaude(options, runner.run)).toEqual({ reviews: 1 });
    expect(runner.calls).toMatchObject([
      { command: '/opt/claude', cwd: '/tmp', input: 'classify' },
    ]);
    expect(stderr).toHaveBeenCalledWith('progress\n');
  });

  it('keeps empty values as their own arguments so nothing is reinterpreted', () => {
    vi.spyOn(process.stderr, 'write').mockReturnValue(true);
    const runner = fakeRunner({ status: 0, stdout: answer, stderr: '' });

    runClaude(options, runner.run);

    const args = runner.calls[0]?.args ?? [];
    expect(valueAfter(args, '--tools')).toBe('');
    expect(valueAfter(args, '--setting-sources')).toBe('');
    expect(args).toContain('--strict-mcp-config');
    expect(args).toContain('--no-session-persistence');
    expect(valueAfter(args, '--model')).toBe(claudeModel);
    expect(valueAfter(args, '--output-format')).toBe('json');
    expect(valueAfter(args, '--system-prompt-file')).toBe('/tmp/system.md');
    expect(valueAfter(args, '--json-schema')).toBe('{"type":"object"}');
  });

  it('keeps the job credentials away from Claude and limits how long it runs', () => {
    vi.stubEnv('GITHUB_TOKEN', 'ghs_app');
    vi.stubEnv('AWS_SESSION_TOKEN', 'aws');
    vi.stubEnv('ACTIONS_ID_TOKEN_REQUEST_TOKEN', 'oidc');
    vi.stubEnv('CLAUDE_CODE_OAUTH_TOKEN', 'oauth');
    vi.spyOn(process.stderr, 'write').mockReturnValue(true);
    const runs: Parameters<CommandRunner>[2][] = [];

    runClaude(options, (_command, _args, runOptions) => {
      runs.push(runOptions);
      return { status: 0, stdout: answer, stderr: '' };
    });

    expect(runs[0]?.timeoutMs).toBeGreaterThan(0);
    expect(runs[0]?.env).toMatchObject({ CLAUDE_CODE_OAUTH_TOKEN: 'oauth' });
    expect(runs[0]?.env).not.toHaveProperty('GITHUB_TOKEN');
    expect(runs[0]?.env).not.toHaveProperty('AWS_SESSION_TOKEN');
    expect(runs[0]?.env).not.toHaveProperty('ACTIONS_ID_TOKEN_REQUEST_TOKEN');
  });

  it('returns nothing when Claude fails, reports an error or gives no structured output', () => {
    vi.spyOn(process.stderr, 'write').mockReturnValue(true);
    const failed = JSON.stringify({ is_error: true, structured_output: {} });
    const textOnly = JSON.stringify({ is_error: false, result: 'text' });

    for (const result of [
      { status: 1, stdout: answer },
      { status: 0, stdout: 'not json' },
      { status: 0, stdout: failed },
      { status: 0, stdout: textOnly },
    ]) {
      expect(runClaude(options, fakeRunner({ ...result, stderr: '' }).run)).toBeUndefined();
    }
  });
});
