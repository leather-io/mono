import { describe, expect, it } from 'vitest';

import {
  decisionContext,
  describeDecision,
  describeSource,
  hasAnsweredDecision,
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

describe('resolveDecision', () => {
  const copyOnly = { reviews: 1, confidence: 'high', reason: 'copy', summary: 'copy' };

  it('prefers the rule decision', () => {
    const decision = resolveDecision({
      ruleDecision: { reviews: 2, confidence: 'high', reason: 'lockfile', summary: 'lockfile' },
      structuredOutput: copyOnly,
    });
    expect([decision.reviews, decision.source]).toEqual([2, 'rules']);
  });

  it('returns the model answer', () => {
    const decision = resolveDecision({ structuredOutput: copyOnly });
    expect([decision.reviews, decision.source]).toEqual([1, 'model']);
  });

  it('requires 2 reviews when Claude is not confident that 1 is enough', () => {
    const decision = resolveDecision({ structuredOutput: { ...copyOnly, confidence: 'low' } });
    expect([decision.reviews, decision.source]).toEqual([2, 'model']);
    expect(decision.reason).toMatch(/^Claude was not confident/);
  });

  it('requires 2 reviews when Claude did not answer', () => {
    const decision = resolveDecision({});
    expect([decision.reviews, decision.source]).toEqual([2, 'fallback']);
  });

  it.each([
    ['has an out-of-range review count', { ...copyOnly, reviews: 3 }],
    ['has no summary', { reviews: 1, confidence: 'low', reason: 'copy only' }],
    ['is not an object', 'one review'],
  ])('requires 2 reviews when the answer %s', (_, structuredOutput) => {
    const decision = resolveDecision({ structuredOutput });
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

describe('describeSource', () => {
  it('names each decision source for people', () => {
    expect(describeSource('rules')).toBe('path rules');
    expect(describeSource('model')).toBe('Claude (claude-opus-5-5)');
    expect(describeSource('fallback')).toMatch(/^fallback/);
  });
});
