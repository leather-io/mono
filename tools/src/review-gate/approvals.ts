import { botAccountType, fixIssueBranch } from '../fix-issue/revise-state.js';
import type { CommitPullRequest, PullRequest, Review, WorkflowRun } from './schemas.js';

const maxStatusDescriptionLength = 140;
const humanAccountType = 'User';
const decisiveReviewStates = new Set(['APPROVED', 'CHANGES_REQUESTED', 'DISMISSED']);
const fixIssueWorkflowPath = '.github/workflows/repo:fix-issue.yml';
const dispatchEvent = 'workflow_dispatch';

interface ApproverContext {
  readonly headSha: string;
  readonly author: string;
  readonly teamId: number;
}

interface Approver {
  readonly login: string;
  readonly forTeam: boolean;
}

export function findFixIssueRun(pullRequest: Pick<PullRequest, 'user' | 'head'>) {
  return pullRequest.user.type === botAccountType ? fixIssueBranch(pullRequest.head.ref) : null;
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
  return [...new Set(logins)];
}

export function isDispatcher(login: string, dispatchers: readonly string[]): boolean {
  return dispatchers.some(dispatcher => dispatcher.toLowerCase() === login.toLowerCase());
}

export function findApprovers(
  reviews: readonly Review[],
  { headSha, author, teamId }: ApproverContext
): Approver[] {
  const latestByReviewer = new Map<string, Review & { author: NonNullable<Review['author']> }>();
  for (const review of reviews) {
    const reviewer = review.author;
    if (!reviewer || !decisiveReviewStates.has(review.state)) continue;
    latestByReviewer.set(reviewer.login, { ...review, author: reviewer });
  }
  return [...latestByReviewer.values()]
    .filter(
      review =>
        review.state === 'APPROVED' &&
        review.commit?.oid === headSha &&
        review.author.login !== author &&
        review.author.__typename === humanAccountType
    )
    .map(review => ({
      login: review.author.login,
      forTeam: review.onBehalfOf.nodes.some(team => team?.databaseId === teamId),
    }));
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
  readonly sharedWith: readonly number[];
  readonly undispatched: boolean;
  readonly dispatcherApprovals: readonly string[];
}

interface GateStatus {
  readonly state: 'success' | 'failure';
  readonly description: string;
}

export function describeGate({
  approvals,
  required,
  sharedWith,
  undispatched,
  dispatcherApprovals,
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
  const count = `${approvals} of ${required} required approvals`;
  const ignored =
    dispatcherApprovals.length > 0
      ? `; ${dispatcherApprovals.join(', ')} dispatched the fix, so cannot approve it`
      : '';
  return {
    state: approvals >= required ? 'success' : 'failure',
    description: `${count}${ignored}`.slice(0, maxStatusDescriptionLength),
  };
}
