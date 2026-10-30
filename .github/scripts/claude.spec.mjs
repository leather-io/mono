import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildClaudeArgs, claudeModel, parseClaudeOutput } from './claude.mjs';

const schema = { type: 'object' };

function valueAfter(args, flag) {
  return args[args.indexOf(flag) + 1];
}

describe('buildClaudeArgs', () => {
  it('keeps empty values as their own arguments so nothing is reinterpreted', () => {
    const args = buildClaudeArgs({ systemPromptPath: '/tmp/system.md', schema });
    assert.equal(valueAfter(args, '--tools'), '');
    assert.equal(valueAfter(args, '--setting-sources'), '');
    assert.ok(args.includes('--strict-mcp-config'));
    assert.ok(args.includes('--no-session-persistence'));
    assert.equal(valueAfter(args, '--model'), claudeModel);
    assert.equal(valueAfter(args, '--output-format'), 'json');
  });

  it('allows the given tools and extra directories', () => {
    const args = buildClaudeArgs({
      systemPromptPath: '/tmp/system.md',
      schema,
      tools: ['Read', 'Grep'],
      addDirs: ['/tmp/context'],
    });
    assert.equal(valueAfter(args, '--tools'), 'Read,Grep');
    assert.equal(valueAfter(args, '--allowedTools'), 'Read,Grep');
    assert.equal(valueAfter(args, '--add-dir'), '/tmp/context');
    assert.equal(valueAfter(args, '--json-schema'), '{"type":"object"}');
  });
});

describe('parseClaudeOutput', () => {
  it('returns the structured output', () => {
    const text = JSON.stringify({ type: 'result', is_error: false, structured_output: { a: 1 } });
    assert.deepEqual(parseClaudeOutput(text), { a: 1 });
  });

  it('returns null for errors, missing output and invalid JSON', () => {
    assert.equal(
      parseClaudeOutput(JSON.stringify({ is_error: true, structured_output: {} })),
      null
    );
    assert.equal(parseClaudeOutput(JSON.stringify({ is_error: false, result: 'text' })), null);
    assert.equal(parseClaudeOutput('not json'), null);
  });
});
