import { afterEach, describe, expect, it, vi } from 'vitest';

import { buildClaudeArgs, claudeModel, parseClaudeOutput, runClaude } from './claude.js';
import type { CommandRunner } from './exec.js';

const schema = { type: 'object' };

function valueAfter(args: readonly string[], flag: string): string | undefined {
  return args[args.indexOf(flag) + 1];
}

describe('buildClaudeArgs', () => {
  it('keeps empty values as their own arguments so nothing is reinterpreted', () => {
    const args = buildClaudeArgs({ systemPromptPath: '/tmp/system.md', schema });
    expect(valueAfter(args, '--tools')).toBe('');
    expect(valueAfter(args, '--setting-sources')).toBe('');
    expect(args).toContain('--strict-mcp-config');
    expect(args).toContain('--no-session-persistence');
    expect(valueAfter(args, '--model')).toBe(claudeModel);
    expect(valueAfter(args, '--output-format')).toBe('json');
  });

  it('allows the given tools and extra directories', () => {
    const args = buildClaudeArgs({
      systemPromptPath: '/tmp/system.md',
      schema,
      tools: ['Read', 'Grep'],
      addDirs: ['/tmp/context'],
    });
    expect(valueAfter(args, '--tools')).toBe('Read,Grep');
    expect(valueAfter(args, '--allowedTools')).toBe('Read,Grep');
    expect(valueAfter(args, '--add-dir')).toBe('/tmp/context');
    expect(valueAfter(args, '--json-schema')).toBe('{"type":"object"}');
  });
});

describe('parseClaudeOutput', () => {
  it('returns the structured output', () => {
    const text = JSON.stringify({ type: 'result', is_error: false, structured_output: { a: 1 } });
    expect(parseClaudeOutput(text)).toEqual({ a: 1 });
  });

  it('returns null for errors, missing output and invalid JSON', () => {
    expect(parseClaudeOutput(JSON.stringify({ is_error: true, structured_output: {} }))).toBeNull();
    expect(parseClaudeOutput(JSON.stringify({ is_error: false, result: 'text' }))).toBeNull();
    expect(parseClaudeOutput('not json')).toBeNull();
  });
});

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

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('runs the pinned binary with the prompt on standard input and returns its answer', () => {
    vi.stubEnv('CLAUDE_BIN', '/opt/claude');
    const stderr = vi.spyOn(process.stderr, 'write').mockReturnValue(true);
    const runner = fakeRunner({ status: 0, stdout: answer, stderr: 'progress\n' });

    expect(
      runClaude({ args: ['--print'], prompt: 'classify', cwd: '/tmp/gate' }, runner.run)
    ).toEqual({
      reviews: 1,
    });
    expect(runner.calls).toEqual([
      { command: '/opt/claude', args: ['--print'], cwd: '/tmp/gate', input: 'classify' },
    ]);
    expect(stderr).toHaveBeenCalledWith('progress\n');
  });

  it('falls back to claude on the PATH when no binary is pinned', () => {
    vi.stubEnv('CLAUDE_BIN', '');
    vi.spyOn(process.stderr, 'write').mockReturnValue(true);
    const runner = fakeRunner({ status: 0, stdout: answer, stderr: '' });

    runClaude({ args: [], prompt: '', cwd: '/tmp' }, runner.run);

    expect(runner.calls[0]?.command).toBe('claude');
  });

  it('throws when Claude fails or gives no structured output', () => {
    vi.spyOn(process.stderr, 'write').mockReturnValue(true);
    const options = { args: [], prompt: '', cwd: '/tmp' };

    expect(() =>
      runClaude(options, fakeRunner({ status: 1, stdout: answer, stderr: '' }).run)
    ).toThrow('Claude exited with 1 and no structured output');
    expect(() =>
      runClaude(options, fakeRunner({ status: 0, stdout: 'not json', stderr: '' }).run)
    ).toThrow('Claude exited with 0 and no structured output');
  });
});
