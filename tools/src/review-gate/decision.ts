import { z } from 'zod';

import { claudeModel } from '../ci/claude.js';
import { describeError, describeZodError, neutraliseMentions } from '../ci/github.js';
import type { CommitStatus, IssueComment } from './schemas.js';

export const decisionContext = 'review-gate/decision';
export const decisionCommentHeading = '### Review gate';
const maxStatusDescriptionLength = 140;
const truncationMarker = '...';
const fallbackMarker = ' (fallback)';

const confidences = ['low', 'medium', 'high'] as const;
const sources = ['rules', 'model', 'fallback'] as const;

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

const decisionSchema = tierSchema.extend({ source: z.enum(sources) });
type DecisionSource = (typeof sources)[number];
export type Decision = z.infer<typeof decisionSchema>;

export function parseTier(value: unknown): Tier {
  const parsed = tierSchema.safeParse(typeof value === 'string' ? JSON.parse(value) : value);
  if (!parsed.success) throw new Error(describeZodError(parsed.error));
  return parsed.data;
}

function failClosed(reason: string): Decision {
  return { reviews: 2, confidence: 'high', reason, summary: reason, source: 'fallback' };
}

interface ResolveDecisionInput {
  readonly ruleDecision?: string;
  readonly structuredOutput?: string;
}

export function resolveDecision({
  ruleDecision,
  structuredOutput,
}: ResolveDecisionInput): Decision {
  if (ruleDecision) {
    try {
      return { ...parseTier(ruleDecision), source: 'rules' };
    } catch (error) {
      return failClosed(
        `The path rule decision was invalid (${describeError(error)}), so 2 reviews are required.`
      );
    }
  }
  if (!structuredOutput) return failClosed('Claude returned no answer, so 2 reviews are required.');
  try {
    return { ...parseTier(structuredOutput), source: 'model' };
  } catch (error) {
    return failClosed(
      `Claude's answer was invalid (${describeError(error)}), so 2 reviews are required.`
    );
  }
}

export function parseDecision(value: string | undefined): Decision {
  if (!value) return failClosed('Classification did not finish, so 2 reviews are required.');
  try {
    const parsed = decisionSchema.safeParse(JSON.parse(value));
    if (!parsed.success) throw new Error(describeZodError(parsed.error));
    return parsed.data;
  } catch (error) {
    return failClosed(
      `The decision was invalid (${describeError(error)}), so 2 reviews are required.`
    );
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

interface DecisionCommentContext {
  readonly headSha: string;
  readonly runUrl: string;
}

export function formatDecisionComment(
  decision: Decision,
  { headSha, runUrl }: DecisionCommentContext
): string {
  return neutraliseMentions(
    `${decisionCommentHeading}: ${formatReviewCount(decision.reviews)}\n\n${decision.reason}\n\n` +
      `Decided by ${describeSource(decision.source)} with ${decision.confidence} confidence for ${headSha}. ` +
      `[Run](${runUrl})`
  );
}

export function findDecisionComment(
  comments: readonly IssueComment[],
  trustedCreator: string
): IssueComment | undefined {
  return comments.find(
    comment =>
      comment.user?.login === trustedCreator &&
      comment.body?.startsWith(`${decisionCommentHeading}:`)
  );
}
