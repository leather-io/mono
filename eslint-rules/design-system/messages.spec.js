import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { designSystemRules } from './index.js';

// Every design rule teaches the replacement. A message that only says "don't"
// leaves an agent guessing, so the shape is enforced here.
const messageShape = /^Use .+ instead .+ — \{\{link\}\}$/;

describe('design-system rule messages', () => {
  for (const [ruleName, rule] of Object.entries(designSystemRules)) {
    describe(ruleName, () => {
      it('has a description', () => {
        assert.ok(rule.meta.docs.description.length > 0);
      });

      for (const [messageId, message] of Object.entries(rule.meta.messages)) {
        it(`${messageId} starts with "Use … instead" and ends with the never.md link`, () => {
          assert.match(message, messageShape);
        });
      }
    });
  }
});
