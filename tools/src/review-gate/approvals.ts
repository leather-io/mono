import type { CommitPullRequest, Permission, PullRequest, Review, WorkflowRun } from './schemas.js';

const maxStatusDescriptionLength = 140;
const writePermissions = new Set(['admin', 'write']);
const humanAccountType = 'User';
const botAccountType = 'Bot';
const decisiveReviewStates = new Set(['APPROVED', 'CHANGES_REQUESTED', 'DISMISSED']);
const fixIssueBranchPattern = /^bot\/fix-issue-(\d+)-(\d+)$/;
const fixIssueWorkflowPath = '.github/workflows/repo:fix-issue.yml';
const dispatchEvent = 'workflow_dispatch';

interface ApproverContext {
  readonly headSha: string;
  readonly author: string;
}

interface Approver {
  readonly login: string;
  readonly reviewId: number;
}

interface FixIssueRun {
  readonly issue: string;
  readonly runId: string;
}

export function findFixIssueRun(
  pullRequest: Pick<PullRequest, 'user' | 'head'>
): FixIssueRun | null {
  const [, issue, runId] = fixIssueBranchPattern.exec(pullRequest.head.ref) ?? [];
  if (pullRequest.user.type !== botAccountType || issue === undefined || runId === undefined) {
    return null;
  }
  return { issue, runId };
}

export function findDispatchers(run: WorkflowRun | null, issue: string): string[] {
  if (
    run?.path !== fixIssueWorkflowPath ||
    run.event !== dispatchEvent ||
    run.display_title !== `fix-issue: #${issue}`
  ) {
    return [];
  }
  const logins = [run.actor, run.triggering_actor].flatMap(account =>
    account ? [account.login] : []
  );
  return logins.filter((login, index) => !isDispatcher(login, logins.slice(0, index)));
}

export function isDispatcher(login: string, dispatchers: readonly string[]): boolean {
  return dispatchers.some(dispatcher => dispatcher.toLowerCase() === login.toLowerCase());
}

export function findApprovers(
  reviews: readonly Review[],
  { headSha, author }: ApproverContext
): Approver[] {
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
    .map(review => ({ login: review.user.login, reviewId: review.id }));
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
  readonly undispatched?: boolean;
  readonly dispatcherApprovals?: readonly string[];
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
  undispatched = false,
  dispatcherApprovals = [],
}: GateInput): GateStatus {
  if (undispatched) {
    return {
      state: 'failure',
      description: 'No fix-issue run dispatched by a person was found for this bot pull request.',
    };
  }
  if (sharedWith.length > 0) {
    const others = sharedWith.map(number => `#${number}`).join(', ');
    const description = `Head commit is also the head of ${others}. Push a commit unique to this pull request.`;
    return { state: 'failure', description: description.slice(0, maxStatusDescriptionLength) };
  }
  const count = `${approvals} of ${required} required approvals${fromFork ? ' (fork pull request)' : ''}`;
  const ignored =
    dispatcherApprovals.length > 0
      ? `; ${dispatcherApprovals.join(', ')} dispatched the fix, so cannot approve it`
      : '';
  return {
    state: approvals >= required ? 'success' : 'failure',
    description: `${count}${ignored}`.slice(0, maxStatusDescriptionLength),
  };
}
