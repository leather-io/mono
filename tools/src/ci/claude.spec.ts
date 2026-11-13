import { describe, expect, it } from 'vitest';

import { buildClaudeArgs, claudeModel, parseClaudeOutput } from './claude.js';

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
