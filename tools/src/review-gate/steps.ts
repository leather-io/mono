import { mkdtempSync } from 'node:fs';
import path from 'node:path';

import {
  type TokenPermissions,
  revokeInstallationToken,
  writeAppTokenOutput,
} from '../ci/app-token.js';
import { claudeModel, runClaude } from '../ci/claude.js';
import { createGitHubClient, readRequiredEnv, writeSummary } from '../ci/github.js';
import { writeStepOutputs } from '../ci/outputs.js';
import {
  describeGate,
  findApprovers,
  findDispatchers,
  findFixIssueRun,
  findSharedHeadPullRequests,
  isDispatcher,
} from './approvals.js';
import { createGateClient } from './client.js';
import {
  type Decision,
  type DecisionSource,
  decisionContext,
  describeDecision,
  formatClassifierAnswer,
  formatReviewCount,
  hasAnsweredDecision,
  hasPostedDecision,
  readClassifierAnswer,
  requiredApprovals,
  resolveDecision,
  tierJsonSchema,
} from './decision.js';
import { buildPrompt, classifierPromptPath, decideByRules, needsBaseBlob } from './rules.js';
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

const sourceLabels: Record<DecisionSource, string> = {
  rules: 'path rules',
  model: `Claude (${claudeModel})`,
  fallback: 'fallback, because Claude gave no usable answer',
};

type GateClient = ReturnType<typeof createGateClient>;

interface GateRun {
  readonly github: GateClient;
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
  return runClaude({
    systemPromptPath: classifierPromptPath,
    schema: tierJsonSchema,
    prompt,
    cwd: mkdtempSync(path.join(readRequiredEnv('RUNNER_TEMP'), 'review-gate-')),
  });
}

async function decideByPaths(github: GateClient, pullRequest: PullRequest) {
  const files = await github.listFiles(pullRequest.base.sha, pullRequest.head.sha);
  const baseBlobs = files.some(needsBaseBlob)
    ? await github.listBaseBlobs(pullRequest.base.sha)
    : undefined;
  const sensitiveFiles = findSensitiveFiles(files, readSensitiveGlobs());
  return { files, ruleDecision: decideByRules(pullRequest, files, { baseBlobs, sensitiveFiles }) };
}

async function decide(github: GateClient, pullRequest: PullRequest): Promise<Decision> {
  const { ruleDecision } = await decideByPaths(github, pullRequest);
  return (
    ruleDecision ??
    resolveDecision(readClassifierAnswer(process.env.CLASSIFIER_ANSWER, pullRequest))
  );
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
      `${decision.reason}\n\nDecided by ${sourceLabels[decision.source]}, confidence: ${decision.confidence}.`
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

interface PullRequestOptions {
  readonly pr: string;
}

async function readGatedPullRequest(pr: string) {
  const number = Number(pr);
  if (!Number.isInteger(number) || number <= 0) {
    throw new Error(`${pr} is not a pull request number.`);
  }
  const repository = readRequiredEnv('GITHUB_REPOSITORY');
  const github = createGateClient(createTokenClient(), repository);
  const pullRequest = await github.getPullRequest(number);
  if (pullRequest.state !== 'open' || pullRequest.base.ref !== protectedBaseBranch) {
    writeSummary(
      `#${number}: skipped, it is ${pullRequest.state} and targets ${pullRequest.base.ref}.`
    );
    return null;
  }
  const fromFork = pullRequest.head.repo?.full_name !== repository;
  return { github, pullRequest, fromFork };
}

export async function runClassify({ pr }: PullRequestOptions): Promise<void> {
  const gated = await readGatedPullRequest(pr);
  if (!gated || gated.fromFork) return;
  const { github, pullRequest } = gated;
  if (hasPostedDecision(await github.listStatuses(pullRequest.head.sha))) return;
  const { files, ruleDecision } = await decideByPaths(github, pullRequest);
  if (ruleDecision) return;
  const answer = askClaude(buildPrompt(pullRequest, files));
  if (answer === undefined) return;
  writeStepOutputs({ answer: formatClassifierAnswer(pullRequest, answer) });
}

export async function runCheck({ pr }: PullRequestOptions): Promise<void> {
  const gated = await readGatedPullRequest(pr);
  if (!gated) return;
  const { github, pullRequest, fromFork } = gated;
  const runUrl = readRequiredEnv('RUN_URL');
  const headSha = pullRequest.head.sha;
  try {
    const run: GateRun = {
      github,
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
      await recordDecision(run, pullRequest, await decide(github, pullRequest));
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
