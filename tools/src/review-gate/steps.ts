import { mkdtempSync } from 'node:fs';
import path from 'node:path';

import { runClaude } from '../ci/claude.js';
import { createGitHubClient, describeError, readRequiredEnv, writeSummary } from '../ci/github.js';
import {
  describeGate,
  findApprovers,
  findDispatchers,
  findFixIssueRun,
  findSharedHeadPullRequests,
  hasWriteAccess,
  isDispatcher,
  isForkPullRequest,
} from './approvals.js';
import { buildClassifierArgs } from './classifier.js';
import { createGateClient } from './client.js';
import {
  type Decision,
  decisionContext,
  describeDecision,
  describeSource,
  findDecisionComment,
  formatDecisionComment,
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

type GateClient = ReturnType<typeof createGateClient>;

interface GateRun {
  readonly github: GateClient;
  readonly repository: string;
  readonly runUrl: string;
  readonly trustedCreator: string;
}

function createGateRun(): GateRun {
  const repository = readRequiredEnv('GITHUB_REPOSITORY');
  const client = createGitHubClient({
    token: readRequiredEnv('GITHUB_TOKEN'),
    apiUrl: process.env.GITHUB_API_URL,
  });
  return {
    github: createGateClient(client, repository),
    repository,
    runUrl: readRequiredEnv('RUN_URL'),
    trustedCreator: `${readRequiredEnv('GATE_APP_SLUG')}[bot]`,
  };
}

function askClaude(prompt: string): string | undefined {
  try {
    const answer = runClaude({
      args: buildClassifierArgs(),
      prompt,
      cwd: mkdtempSync(path.join(readRequiredEnv('RUNNER_TEMP'), 'review-gate-')),
    });
    return JSON.stringify(answer);
  } catch (error) {
    console.log(`::warning::Claude did not answer: ${describeError(error)}`);
    return undefined;
  }
}

async function classify(run: GateRun, pullRequest: PullRequest): Promise<Decision> {
  const { github } = run;
  const files = await github.listFiles(pullRequest.number);
  const current = await github.getPullRequest(pullRequest.number);
  if (current.head.sha !== pullRequest.head.sha) {
    return resolveDecision({
      ruleDecision: JSON.stringify(
        requireTwoReviews(
          `The head moved from ${pullRequest.head.sha} to ${current.head.sha} during classification.`
        )
      ),
    });
  }
  const baseBlobs = files.some(needsBaseBlob)
    ? await github.listBaseBlobs(pullRequest.base.sha)
    : undefined;
  const sensitiveFiles = findSensitiveFiles(files, readSensitiveGlobs());
  const ruleDecision = decideByRules(pullRequest, files, { baseBlobs, sensitiveFiles });
  if (ruleDecision) return resolveDecision({ ruleDecision: JSON.stringify(ruleDecision) });
  return resolveDecision({ structuredOutput: askClaude(buildPrompt(pullRequest, files)) });
}

async function recordDecision(
  run: GateRun,
  pullRequest: PullRequest,
  decision: Decision
): Promise<void> {
  const { github, runUrl, trustedCreator } = run;
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
  try {
    const body = formatDecisionComment(decision, { headSha, runUrl });
    const existing = findDecisionComment(
      await github.listComments(pullRequest.number),
      trustedCreator
    );
    if (existing) {
      await github.updateComment(existing.id, body);
    } else {
      await github.createComment(pullRequest.number, body);
    }
  } catch (error) {
    console.log(`::warning::Could not update the review gate comment: ${describeError(error)}`);
  }
}

interface CheckMode {
  readonly fromSweep: boolean;
}

async function countReviewers(
  github: GateClient,
  number: number,
  approvers: ReturnType<typeof findApprovers>,
  requiredTeams: ReadonlySet<number>
): Promise<number> {
  if (requiredTeams.size > 0) {
    const teamReviewIds = await github.listTeamReviewIds(number, requiredTeams);
    return approvers.filter(({ reviewId }) => teamReviewIds.has(reviewId)).length;
  }
  const permissions = await Promise.all(approvers.map(({ login }) => github.getPermission(login)));
  return permissions.filter(hasWriteAccess).length;
}

async function countApprovals(
  run: GateRun,
  pullRequest: PullRequest,
  { fromFork, fromSweep }: CheckMode & { readonly fromFork: boolean }
): Promise<void> {
  const { github, runUrl, trustedCreator } = run;
  const { number } = pullRequest;
  const headSha = pullRequest.head.sha;
  const fixIssueRun = fromFork ? null : findFixIssueRun(pullRequest);
  const [reviews, statuses, commitPullRequests, requiredTeams, workflowRun] = await Promise.all([
    github.listReviews(number),
    github.listStatuses(headSha),
    github.listCommitPullRequests(headSha),
    github.listRequiredReviewerTeams(pullRequest.base.ref),
    fixIssueRun ? github.getWorkflowRun(fixIssueRun.runId) : null,
  ]);
  const required = requiredApprovals(statuses, { fromFork, trustedCreator });
  const dispatchers = fixIssueRun ? findDispatchers(workflowRun, fixIssueRun.issue) : [];
  const approvers = findApprovers(reviews, { headSha, author: pullRequest.user.login });
  const independent = approvers.filter(({ login }) => !isDispatcher(login, dispatchers));
  const approvals = await countReviewers(github, number, independent, requiredTeams);
  const sharedWith = findSharedHeadPullRequests(commitPullRequests, { number, headSha });
  const gate = describeGate({
    approvals,
    required,
    sharedWith,
    fromFork,
    undispatched: fixIssueRun !== null && dispatchers.length === 0,
    dispatcherApprovals: approvers
      .filter(({ login }) => isDispatcher(login, dispatchers))
      .map(({ login }) => login),
  });
  const latest = statuses.find(
    status => status.context === gateContext && status.creator?.login === trustedCreator
  );
  if (fromSweep && latest?.state === gate.state && latest.description === gate.description) return;
  await github.createStatus(headSha, { ...gate, context: gateContext, target_url: runUrl });
  const dispatchedBy = dispatchers.length > 0 ? ` Dispatched by ${dispatchers.join(', ')}.` : '';
  writeSummary(`#${number}: ${gate.description} on ${headSha}.${dispatchedBy}`);
}

async function checkPullRequest(
  run: GateRun,
  pullRequest: PullRequest,
  { fromSweep }: CheckMode
): Promise<void> {
  const { github, runUrl, repository, trustedCreator } = run;
  const headSha = pullRequest.head.sha;
  if (pullRequest.state !== 'open' || pullRequest.base.ref !== protectedBaseBranch) {
    writeSummary(
      `#${pullRequest.number}: skipped, it is ${pullRequest.state} and targets ${pullRequest.base.ref}.`
    );
    return;
  }
  const fromFork = isForkPullRequest(pullRequest, repository);
  try {
    if (!fromSweep) {
      await github.createStatus(headSha, {
        state: 'pending',
        context: gateContext,
        description: 'Waiting for the review decision and approval count',
        target_url: runUrl,
      });
    }
    const decided = hasAnsweredDecision(await github.listStatuses(headSha), trustedCreator);
    if (!fromFork && !decided) {
      await recordDecision(run, pullRequest, await classify(run, pullRequest));
    }
    await countApprovals(run, pullRequest, { fromFork, fromSweep });
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

interface CheckOptions {
  readonly pr: string;
}

export async function runCheck({ pr }: CheckOptions): Promise<void> {
  const number = Number(pr);
  if (!Number.isInteger(number) || number <= 0) {
    throw new Error(`${pr} is not a pull request number.`);
  }
  const run = createGateRun();
  await checkPullRequest(run, await run.github.getPullRequest(number), { fromSweep: false });
}

export async function runSweep(): Promise<void> {
  const run = createGateRun();
  const pullRequests = await run.github.listOpenPullRequests(protectedBaseBranch);
  const forks = pullRequests.filter(pullRequest => isForkPullRequest(pullRequest, run.repository));
  const failed: number[] = [];
  for (const pullRequest of forks) {
    try {
      await checkPullRequest(run, pullRequest, { fromSweep: true });
    } catch (error) {
      console.log(`::error::#${pullRequest.number}: ${describeError(error)}`);
      failed.push(pullRequest.number);
    }
  }
  writeSummary(`Checked ${forks.length} fork pull requests into ${protectedBaseBranch}.`);
  if (failed.length > 0) {
    throw new Error(`The gate failed for ${failed.map(number => `#${number}`).join(', ')}.`);
  }
}
