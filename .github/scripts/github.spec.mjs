import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { neutraliseMentions } from './github.mjs';

describe('neutraliseMentions', () => {
  it('defuses user and team mentions', () => {
    assert.doesNotMatch(neutraliseMentions('ping @alice'), /@alice/);
    assert.doesNotMatch(neutraliseMentions('ask @leather-io/reviewers'), /@leather-io/);
  });

  it('keeps package names with a dotted scope intact', () => {
    assert.equal(
      neutraliseMentions('import from @leather.io/utils'),
      'import from @leather.io/utils'
    );
  });

  it('leaves inline code and code blocks untouched', () => {
    assert.equal(neutraliseMentions('use `@stacks/transactions`'), 'use `@stacks/transactions`');
    assert.equal(neutraliseMentions('```\n@alice\n```'), '```\n@alice\n```');
  });
});
