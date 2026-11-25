import {
  type TokenPermissions,
  revokeInstallationToken,
  writeAppTokenOutput,
} from '../ci/app-token.js';
import { createGitHubClient, readRequiredEnv, writeSummary } from '../ci/github.js';
import {
  describeGate,
  findApprovers,
  findDispatchers,
  findFixIssueRun,
  findSharedHeadPullRequests,
  isDispatcher,
} from './approvals.js';
import { createGateClient } from './client.js';
import type { PullRequest } from './schemas.js';

const gateContext = 'review-gate';
const protectedBaseBranch = 'dev';
const requiredApprovals = 2;
const reviewersTeamId = 19686212;
const appTokenPermissions: TokenPermissions = {
  actions: 'read',
  members: 'read',
  pull_requests: 'read',
  statuses: 'write',
};

type GateClient = ReturnType<typeof createGateClient>;

function createTokenClient() {
  return createGitHubClient({
    token: readRequiredEnv('GITHUB_TOKEN'),
    apiUrl: process.env.GITHUB_API_URL,
  });
}

async function countApprovals(
  github: GateClient,
  runUrl: string,
  pullRequest: PullRequest
): Promise<void> {
  const { number } = pullRequest;
  const headSha = pullRequest.head.sha;
  const fixIssueRun = findFixIssueRun(pullRequest);
  const [reviews, commitPullRequests, workflowRun] = await Promise.all([
    github.listReviews(number),
    github.listCommitPullRequests(headSha),
    fixIssueRun ? github.getWorkflowRun(fixIssueRun.runId) : null,
  ]);
  const dispatchers = fixIssueRun ? findDispatchers(workflowRun, fixIssueRun.issue) : [];
  const approvers = findApprovers(reviews, {
    headSha,
    author: pullRequest.user.login,
    teamId: reviewersTeamId,
  });
  const independent = approvers.filter(({ login }) => !isDispatcher(login, dispatchers));
  const approvals = independent.filter(({ forTeam }) => forTeam).length;
  const sharedWith = findSharedHeadPullRequests(commitPullRequests, { number, headSha });
  const gate = describeGate({
    approvals,
    required: requiredApprovals,
    sharedWith,
    undispatched: fixIssueRun !== null && dispatchers.length === 0,
    dispatcherApprovals: approvers
      .filter(({ login }) => isDispatcher(login, dispatchers))
      .map(({ login }) => login),
  });
  await github.createStatus(headSha, { ...gate, context: gateContext, target_url: runUrl });
  const dispatchedBy = dispatchers.length > 0 ? ` Dispatched by ${dispatchers.join(', ')}.` : '';
  writeSummary(`#${number}: ${gate.description} on ${headSha}.${dispatchedBy}`);
}

interface CheckOptions {
  readonly pr: string;
}

export async function runCheck({ pr }: CheckOptions): Promise<void> {
  const number = Number(pr);
  if (!Number.isInteger(number) || number <= 0) {
    throw new Error(`${pr} is not a pull request number.`);
  }
  const github = createGateClient(createTokenClient(), readRequiredEnv('GITHUB_REPOSITORY'));
  const runUrl = readRequiredEnv('RUN_URL');
  const pullRequest = await github.getPullRequest(number);
  if (pullRequest.state !== 'open' || pullRequest.base.ref !== protectedBaseBranch) {
    writeSummary(
      `#${number}: skipped, it is ${pullRequest.state} and targets ${pullRequest.base.ref}.`
    );
    return;
  }
  try {
    await countApprovals(github, runUrl, pullRequest);
  } catch (error) {
    await github.createStatus(pullRequest.head.sha, {
      state: 'error',
      context: gateContext,
      description: 'Could not count approvals. Re-run repo:review-gate to retry.',
      target_url: runUrl,
    });
    throw error;
  }
}

interface AppTokenOptions {
  readonly clientId: string;
  readonly kmsKeyId: string;
}

export function createAppToken({ clientId, kmsKeyId }: AppTokenOptions): Promise<void> {
  return writeAppTokenOutput({ clientId, kmsKeyId, permissions: appTokenPermissions });
}

export async function revokeAppToken(): Promise<void> {
  await revokeInstallationToken(createTokenClient());
  console.log('app-token: revoked the installation token');
}
