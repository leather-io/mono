import { describe, expect, it } from 'vitest';

import {
  type Decision,
  decisionCommentHeading,
  decisionContext,
  describeDecision,
  describeSource,
  findDecisionComment,
  formatDecisionComment,
  hasAnsweredDecision,
  parseDecision,
  parseTier,
  requiredApprovals,
  resolveDecision,
} from './decision.js';
import type { CommitStatus } from './schemas.js';

const trustedCreator = 'leather-review-gate[bot]';

function status(description: string, overrides: Partial<CommitStatus> = {}): CommitStatus {
  return {
    context: decisionContext,
    state: 'success',
    description,
    creator: { login: trustedCreator },
    ...overrides,
  };
}

describe('parseTier', () => {
  it('accepts a valid answer', () => {
    expect(
      parseTier('{"reviews":1,"confidence":"low","reason":"copy only","summary":"copy"}')
    ).toEqual({ reviews: 1, confidence: 'low', reason: 'copy only', summary: 'copy' });
  });

  it('rejects an answer without a summary', () => {
    expect(() => parseTier('{"reviews":1,"confidence":"low","reason":"copy only"}')).toThrow();
  });

  it('rejects an out-of-range review count', () => {
    expect(() => parseTier('{"reviews":0,"confidence":"low","reason":"x"}')).toThrow();
  });
});

describe('resolveDecision', () => {
  it('prefers the rule decision', () => {
    const decision = resolveDecision({
      ruleDecision: '{"reviews":2,"confidence":"high","reason":"lockfile","summary":"lockfile"}',
      structuredOutput: '{"reviews":1,"confidence":"high","reason":"copy","summary":"copy"}',
    });
    expect([decision.reviews, decision.source]).toEqual([2, 'rules']);
  });

  it('requires 2 reviews when the rule decision is invalid', () => {
    const decision = resolveDecision({ ruleDecision: '{"reviews":1}' });
    expect([decision.reviews, decision.source]).toEqual([2, 'fallback']);
  });

  it('returns the model answer', () => {
    const decision = resolveDecision({
      structuredOutput: '{"reviews":1,"confidence":"high","reason":"copy","summary":"copy"}',
    });
    expect([decision.reviews, decision.source]).toEqual([1, 'model']);
  });

  it('requires 2 reviews when Claude did not answer', () => {
    const decision = resolveDecision({ structuredOutput: '' });
    expect([decision.reviews, decision.source]).toEqual([2, 'fallback']);
  });

  it('requires 2 reviews when the answer is invalid', () => {
    const decision = resolveDecision({ structuredOutput: '{"reviews":3}' });
    expect([decision.reviews, decision.source]).toEqual([2, 'fallback']);
  });
});

describe('parseDecision', () => {
  it('requires 2 reviews when classification did not run', () => {
    expect(parseDecision(undefined).reviews).toBe(2);
  });

  it('keeps a valid decision', () => {
    const decision = parseDecision(
      '{"reviews":1,"confidence":"medium","reason":"copy","summary":"copy","source":"model"}'
    );
    expect([decision.reviews, decision.source]).toEqual([1, 'model']);
  });

  it('requires 2 reviews for an unknown source', () => {
    const decision = parseDecision(
      '{"reviews":1,"confidence":"medium","reason":"copy","summary":"copy","source":"author"}'
    );
    expect([decision.reviews, decision.source]).toEqual([2, 'fallback']);
  });
});

describe('describeDecision', () => {
  it('shows the summary rather than the full reason', () => {
    expect(describeDecision({ reviews: 1, summary: 'copy only' })).toBe(
      '1 review required: copy only'
    );
  });

  it('marks fallback decisions', () => {
    expect(describeDecision({ reviews: 2, summary: 'no answer', source: 'fallback' })).toBe(
      '2 reviews required (fallback): no answer'
    );
  });

  it('fits the commit status description limit', () => {
    const description = describeDecision({ reviews: 2, summary: 'x'.repeat(500) });
    expect(description).toHaveLength(140);
    expect(description).toMatch(/^2 reviews required: x+\.\.\.$/);
  });
});

describe('requiredApprovals', () => {
  const sameRepo = { fromFork: false, trustedCreator };

  it('requires 2 approvals for a fork pull request whatever was recorded', () => {
    expect(
      requiredApprovals([status(describeDecision({ reviews: 1, summary: 'copy only' }))], {
        fromFork: true,
        trustedCreator,
      })
    ).toBe(2);
  });

  it('requires 1 approval only for a single-review decision from the workflow', () => {
    expect(
      requiredApprovals([status(describeDecision({ reviews: 1, summary: 'copy only' }))], sameRepo)
    ).toBe(1);
    expect(
      requiredApprovals([status(describeDecision({ reviews: 2, summary: 'signing' }))], sameRepo)
    ).toBe(2);
  });

  it('requires 2 approvals without a recorded decision', () => {
    expect(requiredApprovals([], sameRepo)).toBe(2);
  });

  it('ignores decisions posted by anyone other than the gate app', () => {
    const forged = status('1 review required: trust me', { creator: { login: 'author' } });
    const fromActions = status('1 review required: trust me', {
      creator: { login: 'github-actions[bot]' },
    });
    expect(requiredApprovals([forged], sameRepo)).toBe(2);
    expect(requiredApprovals([fromActions], sameRepo)).toBe(2);
  });

  it('requires 2 approvals when any decision on the head requires 2', () => {
    const statuses = [
      status(describeDecision({ reviews: 1, summary: 'newer' })),
      status(describeDecision({ reviews: 2, summary: 'older' })),
    ];
    expect(requiredApprovals(statuses, sameRepo)).toBe(2);
  });

  it('lets a real answer replace a fallback on the same head', () => {
    const statuses = [
      status(describeDecision({ reviews: 1, summary: 'copy only', source: 'model' })),
      status(describeDecision({ reviews: 2, summary: 'no answer', source: 'fallback' })),
    ];
    expect(requiredApprovals(statuses, sameRepo)).toBe(1);
  });

  it('requires 2 approvals when only fallbacks were recorded', () => {
    const statuses = [
      status(describeDecision({ reviews: 2, summary: 'no answer', source: 'fallback' })),
    ];
    expect(requiredApprovals(statuses, sameRepo)).toBe(2);
  });
});

describe('hasAnsweredDecision', () => {
  it('counts a recorded answer but not a fallback or a forged status', () => {
    const answer = status(describeDecision({ reviews: 2, summary: 'signing', source: 'rules' }));
    const fallback = status(
      describeDecision({ reviews: 2, summary: 'no answer', source: 'fallback' })
    );
    const forged = status('1 review required: x', { creator: { login: 'author' } });
    expect(hasAnsweredDecision([answer], trustedCreator)).toBe(true);
    expect(hasAnsweredDecision([fallback, forged], trustedCreator)).toBe(false);
  });
});

describe('formatDecisionComment', () => {
  const decision: Decision = {
    reviews: 2,
    confidence: 'high',
    reason: 'Touches signing, cc @alice.',
    summary: 'signing',
    source: 'model',
  };

  it('starts with the heading the comment is found by', () => {
    const body = formatDecisionComment(decision, { headSha: 'abc', runUrl: 'https://run' });
    expect(body.startsWith(`${decisionCommentHeading}: 2 reviews required`)).toBe(true);
    expect(body).toMatch(
      /Decided by Claude \(claude-opus-5-5\) with high confidence for abc\. \[Run\]\(https:\/\/run\)/
    );
  });

  it('defuses mentions in the reason', () => {
    const body = formatDecisionComment(decision, { headSha: 'abc', runUrl: 'https://run' });
    expect(body).not.toMatch(/@alice/);
  });
});

describe('findDecisionComment', () => {
  const heading = `${decisionCommentHeading}: 1 review required`;

  it('finds the workflow comment', () => {
    const comments = [
      { id: 1, user: { login: 'alice' }, body: 'Looks good' },
      { id: 2, user: { login: trustedCreator }, body: heading },
    ];
    expect(findDecisionComment(comments, trustedCreator)?.id).toBe(2);
  });

  it('ignores the same heading from anyone else', () => {
    expect(
      findDecisionComment([{ id: 1, user: { login: 'alice' }, body: heading }], trustedCreator)
    ).toBeUndefined();
  });
});

describe('describeSource', () => {
  it('names each decision source for people', () => {
    expect(describeSource('rules')).toBe('path rules');
    expect(describeSource('model')).toBe('Claude (claude-opus-5-5)');
    expect(describeSource('fallback')).toMatch(/^fallback/);
  });
});
