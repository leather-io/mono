import { mkdtempSync } from 'node:fs';
import path from 'node:path';

import {
  type TokenPermissions,
  revokeInstallationToken,
  writeAppTokenOutput,
} from '../ci/app-token.js';
import { runClaude } from '../ci/claude.js';
import { createGitHubClient, describeError, readRequiredEnv, writeSummary } from '../ci/github.js';
import {
  describeGate,
  findApprovers,
  findDispatchers,
  findFixIssueRun,
  findSharedHeadPullRequests,
  isDispatcher,
} from './approvals.js';
import { buildClassifierArgs } from './classifier.js';
import { createGateClient } from './client.js';
import {
  type Decision,
  decisionContext,
  describeDecision,
  describeSource,
  formatReviewCount,
  hasAnsweredDecision,
  requiredApprovals,
  resolveDecision,
} from './decision.js';
import { buildPrompt, decideByRules, needsBaseBlob, requireTwoReviews } from './rules.js';
import type { PullRequest } from './schemas.js';
import { findSensitiveFiles, readSensitiveGlobs } from './sensitive-paths.js';

const gateContext = 'review-gate';
const protectedBaseBranch = 'dev';
const reviewersTeamId = 19686212;
const appTokenPermissions: TokenPermissions = {
  actions: 'read',
  contents: 'read',
  members: 'read',
  pull_requests: 'read',
  statuses: 'write',
};

type GateClient = ReturnType<typeof createGateClient>;

interface GateRun {
  readonly github: GateClient;
  readonly repository: string;
  readonly runUrl: string;
  readonly trustedCreator: string;
}

function createTokenClient() {
  return createGitHubClient({
    token: readRequiredEnv('GITHUB_TOKEN'),
    apiUrl: process.env.GITHUB_API_URL,
  });
}

function askClaude(prompt: string): unknown {
  try {
    return runClaude({
      args: buildClassifierArgs(),
      prompt,
      cwd: mkdtempSync(path.join(readRequiredEnv('RUNNER_TEMP'), 'review-gate-')),
    });
  } catch (error) {
    console.log(`::warning::Claude did not answer: ${describeError(error)}`);
    return undefined;
  }
}

async function classify(github: GateClient, pullRequest: PullRequest): Promise<Decision> {
  const files = await github.listFiles(pullRequest.number);
  const current = await github.getPullRequest(pullRequest.number);
  if (current.head.sha !== pullRequest.head.sha) {
    return resolveDecision({
      ruleDecision: requireTwoReviews(
        `The head moved from ${pullRequest.head.sha} to ${current.head.sha} during classification.`
      ),
    });
  }
  const baseBlobs = files.some(needsBaseBlob)
    ? await github.listBaseBlobs(pullRequest.base.sha)
    : undefined;
  const sensitiveFiles = findSensitiveFiles(files, readSensitiveGlobs());
  const ruleDecision = decideByRules(pullRequest, files, { baseBlobs, sensitiveFiles });
  if (ruleDecision) return resolveDecision({ ruleDecision });
  return resolveDecision({ structuredOutput: askClaude(buildPrompt(pullRequest, files)) });
}

async function recordDecision(
  { github, runUrl }: GateRun,
  pullRequest: PullRequest,
  decision: Decision
): Promise<void> {
  const headSha = pullRequest.head.sha;
  if (decision.source === 'fallback') console.log(`::warning::${decision.reason}`);
  await github.createStatus(headSha, {
    state: 'success',
    context: decisionContext,
    description: describeDecision(decision),
    target_url: runUrl,
  });
  writeSummary(
    `### #${pullRequest.number}: ${formatReviewCount(decision.reviews)}\n\n` +
      `${decision.reason}\n\nDecided by ${describeSource(decision.source)}, confidence: ${decision.confidence}.`
  );
}

async function countApprovals(
  { github, runUrl, trustedCreator }: GateRun,
  pullRequest: PullRequest,
  fromFork: boolean
): Promise<void> {
  const { number } = pullRequest;
  const headSha = pullRequest.head.sha;
  const fixIssueRun = fromFork ? null : findFixIssueRun(pullRequest);
  const [reviews, statuses, commitPullRequests, workflowRun] = await Promise.all([
    github.listReviews(number),
    github.listStatuses(headSha),
    github.listCommitPullRequests(headSha),
    fixIssueRun ? github.getWorkflowRun(fixIssueRun.runId) : null,
  ]);
  const required = requiredApprovals(statuses, { fromFork, trustedCreator });
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
    required,
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
  const repository = readRequiredEnv('GITHUB_REPOSITORY');
  const github = createGateClient(createTokenClient(), repository);
  const runUrl = readRequiredEnv('RUN_URL');
  const pullRequest = await github.getPullRequest(number);
  if (pullRequest.state !== 'open' || pullRequest.base.ref !== protectedBaseBranch) {
    writeSummary(
      `#${number}: skipped, it is ${pullRequest.state} and targets ${pullRequest.base.ref}.`
    );
    return;
  }
  const headSha = pullRequest.head.sha;
  const fromFork = pullRequest.head.repo?.full_name !== repository;
  try {
    const run: GateRun = {
      github,
      repository,
      runUrl,
      trustedCreator: await github.getAppBotLogin(),
    };
    await github.createStatus(headSha, {
      state: 'pending',
      context: gateContext,
      description: 'Waiting for the review decision and approval count',
      target_url: runUrl,
    });
    const decided = hasAnsweredDecision(await github.listStatuses(headSha), run.trustedCreator);
    if (!fromFork && !decided) {
      await recordDecision(run, pullRequest, await classify(github, pullRequest));
    }
    await countApprovals(run, pullRequest, fromFork);
  } catch (error) {
    await github.createStatus(headSha, {
      state: 'error',
      context: gateContext,
      description: 'Could not decide or count approvals. Re-run repo:review-gate to retry.',
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
