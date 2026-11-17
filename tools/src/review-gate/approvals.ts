import type { CommitPullRequest, Permission, PullRequest, Review } from './schemas.js';

const maxStatusDescriptionLength = 140;
const writePermissions = new Set(['admin', 'write']);
const humanAccountType = 'User';
const decisiveReviewStates = new Set(['APPROVED', 'CHANGES_REQUESTED', 'DISMISSED']);

interface ApproverContext {
  readonly headSha: string;
  readonly author: string;
}

export function findApprovers(
  reviews: readonly Review[],
  { headSha, author }: ApproverContext
): string[] {
  const latestByReviewer = new Map<string, Review & { user: NonNullable<Review['user']> }>();
  for (const review of reviews) {
    const { user } = review;
    if (!user || !decisiveReviewStates.has(review.state)) continue;
    latestByReviewer.set(user.login, { ...review, user });
  }
  return [...latestByReviewer.values()]
    .filter(
      review =>
        review.state === 'APPROVED' &&
        review.commit_id === headSha &&
        review.user.login !== author &&
        review.user.type === humanAccountType
    )
    .map(review => review.user.login);
}

export function isForkPullRequest(
  pullRequest: Pick<PullRequest, 'head'>,
  repository: string
): boolean {
  return pullRequest.head.repo?.full_name !== repository;
}

export function hasWriteAccess(permission: Permission | null): boolean {
  return permission !== null && writePermissions.has(permission.permission);
}

interface SharedHeadContext {
  readonly number: number;
  readonly headSha: string;
}

export function findSharedHeadPullRequests(
  pullRequests: readonly CommitPullRequest[],
  { number, headSha }: SharedHeadContext
): number[] {
  return pullRequests
    .filter(
      pullRequest =>
        pullRequest.state === 'open' &&
        pullRequest.number !== number &&
        pullRequest.head.sha === headSha
    )
    .map(pullRequest => pullRequest.number);
}

interface GateInput {
  readonly approvals: number;
  readonly required: number;
  readonly sharedWith?: readonly number[];
  readonly fromFork?: boolean;
}

interface GateStatus {
  readonly state: 'success' | 'failure';
  readonly description: string;
}

export function describeGate({
  approvals,
  required,
  sharedWith = [],
  fromFork = false,
}: GateInput): GateStatus {
  if (sharedWith.length > 0) {
    const others = sharedWith.map(number => `#${number}`).join(', ');
    const description = `Head commit is also the head of ${others}. Push a commit unique to this pull request.`;
    return { state: 'failure', description: description.slice(0, maxStatusDescriptionLength) };
  }
  return {
    state: approvals >= required ? 'success' : 'failure',
    description: `${approvals} of ${required} required approvals${fromFork ? ' (fork pull request)' : ''}`,
  };
}
