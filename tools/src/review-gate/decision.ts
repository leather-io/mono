import { z } from 'zod';

import { claudeModel } from '../ci/claude.js';
import { describeZodError } from '../ci/github.js';
import type { CommitStatus } from './schemas.js';

export const decisionContext = 'review-gate/decision';
const maxStatusDescriptionLength = 140;
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
export type Tier = z.infer<typeof tierSchema>;

type DecisionSource = 'rules' | 'model' | 'fallback';
export type Decision = Tier & { readonly source: DecisionSource };

function failClosed(reason: string): Decision {
  return { reviews: 2, confidence: 'high', reason, summary: reason, source: 'fallback' };
}

interface ResolveDecisionInput {
  readonly ruleDecision?: Tier | null;
  readonly structuredOutput?: unknown;
}

export function resolveDecision({
  ruleDecision,
  structuredOutput,
}: ResolveDecisionInput): Decision {
  if (ruleDecision) return { ...ruleDecision, source: 'rules' };
  if (structuredOutput === undefined) {
    return failClosed('Claude returned no answer, so 2 reviews are required.');
  }
  const parsed = tierSchema.safeParse(structuredOutput);
  if (!parsed.success) {
    return failClosed(
      `Claude's answer was invalid (${describeZodError(parsed.error)}), so 2 reviews are required.`
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

const sourceLabels: Record<DecisionSource, string> = {
  rules: 'path rules',
  model: `Claude (${claudeModel})`,
  fallback: 'fallback, because Claude gave no usable answer',
};

export function describeSource(source: DecisionSource): string {
  return sourceLabels[source];
}
