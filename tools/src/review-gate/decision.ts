import { z } from 'zod';

import { maxStatusDescriptionLength } from './approvals.js';
import type { CommitStatus, PullRequest } from './schemas.js';

export const decisionContext = 'review-gate/decision';
const truncationMarker = '...';
const fallbackMarker = ' (fallback)';

const confidences = ['low', 'medium', 'high'] as const;

export const tierJsonSchema = {
  type: 'object',
  properties: {
    reviews: { type: 'integer', enum: [1, 2] },
    confidence: { type: 'string', enum: confidences },
    reason: { type: 'string' },
    summary: { type: 'string' },
  },
  required: ['reviews', 'confidence', 'reason', 'summary'],
  additionalProperties: false,
};

const tierSchema = z.object({
  reviews: z.union([z.literal(1), z.literal(2)]),
  confidence: z.enum(confidences),
  reason: z.string(),
  summary: z.string(),
});
type Tier = z.infer<typeof tierSchema>;

export type DecisionSource = 'rules' | 'model' | 'fallback';
export type Decision = Tier & { readonly source: DecisionSource };

export function requireTwoReviews(reason: string, source: DecisionSource): Decision {
  return { reviews: 2, confidence: 'high', reason, summary: reason, source };
}

export function resolveDecision(structuredOutput: unknown): Decision {
  if (structuredOutput === undefined) {
    return requireTwoReviews('Claude returned no answer, so 2 reviews are required.', 'fallback');
  }
  const parsed = tierSchema.safeParse(structuredOutput);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map(issue => `${issue.path.map(String).join('.') || 'value'}: ${issue.message}`)
      .join('; ');
    return requireTwoReviews(
      `Claude's answer was invalid (${issues}), so 2 reviews are required.`,
      'fallback'
    );
  }
  const tier = parsed.data;
  if (tier.reviews === 1 && tier.confidence === 'low') {
    return {
      ...tier,
      reviews: 2,
      reason: `Claude was not confident that 1 review is enough, so 2 reviews are required. ${tier.reason}`,
      source: 'model',
    };
  }
  return { ...tier, source: 'model' };
}

const classifierAnswerSchema = z.object({
  base: z.string(),
  head: z.string(),
  answer: z.unknown(),
});

export function formatClassifierAnswer(pullRequest: PullRequest, answer: unknown): string {
  return JSON.stringify({ base: pullRequest.base.sha, head: pullRequest.head.sha, answer });
}

export function readClassifierAnswer(raw: string | undefined, pullRequest: PullRequest): unknown {
  if (!raw) return undefined;
  try {
    const { base, head, answer } = classifierAnswerSchema.parse(JSON.parse(raw));
    return base === pullRequest.base.sha && head === pullRequest.head.sha ? answer : undefined;
  } catch {
    return undefined;
  }
}

export function formatReviewCount(reviews: number): string {
  return `${reviews} review${reviews === 1 ? '' : 's'} required`;
}

type DescribedDecision = Pick<Decision, 'reviews' | 'summary'> & { source?: DecisionSource };

export function describeDecision(decision: DescribedDecision): string {
  const marker = decision.source === 'fallback' ? fallbackMarker : '';
  const description = `${formatReviewCount(decision.reviews)}${marker}: ${decision.summary}`;
  return description.length > maxStatusDescriptionLength
    ? `${description.slice(0, maxStatusDescriptionLength - truncationMarker.length)}${truncationMarker}`
    : description;
}

function isFallback(status: CommitStatus): boolean {
  return status.description?.startsWith(`${formatReviewCount(2)}${fallbackMarker}:`) ?? false;
}

export function hasPostedDecision(statuses: readonly CommitStatus[]): boolean {
  return statuses.some(status => status.context === decisionContext && !isFallback(status));
}

function findAnsweredDecisions(
  statuses: readonly CommitStatus[],
  trustedCreator: string
): CommitStatus[] {
  return statuses.filter(
    status =>
      status.context === decisionContext &&
      status.creator?.login === trustedCreator &&
      !isFallback(status)
  );
}

export function hasAnsweredDecision(
  statuses: readonly CommitStatus[],
  trustedCreator: string
): boolean {
  return findAnsweredDecisions(statuses, trustedCreator).length > 0;
}

interface RequiredApprovalsOptions {
  readonly fromFork: boolean;
  readonly trustedCreator: string;
}

export function requiredApprovals(
  statuses: readonly CommitStatus[],
  { fromFork, trustedCreator }: RequiredApprovalsOptions
): 1 | 2 {
  if (fromFork) return 2;
  const answered = findAnsweredDecisions(statuses, trustedCreator);
  const allowSingleReview =
    answered.length > 0 &&
    answered.every(
      status =>
        status.state === 'success' && status.description?.startsWith(`${formatReviewCount(1)}:`)
    );
  return allowSingleReview ? 1 : 2;
}
