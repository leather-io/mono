import { mkdirSync, writeFileSync } from 'node:fs';
import { z } from 'zod';

import { type GitHubClient, paginate } from '../ci/github.js';
import { extractBrief, isBriefComment } from './brief.js';
import { fetchFeedback, instructionsItemId, mergeItemId, renderFeedback } from './feedback.js';
import { refusedPaths } from './git.js';
import { commentSchema, fetchIssue, isWorkflowAppComment } from './issue.js';
import { ensureCommit, planMerge } from './merge.js';
import type { FixIssuePaths } from './paths.js';
import {
  botAccountType,
  isReviseSummary,
  issueOfBranch,
  maxRevises,
  revisePullSchema,
} from './revise-state.js';

interface GateOptions {
  readonly client: GitHubClient;
  readonly repo: string;
  readonly paths: FixIssuePaths;
  readonly pullRequest: number;
  readonly devSha: string;
  readonly baseBranch: string;
  readonly mergeRequested: boolean;
  readonly instructions: string;
  readonly requestedBy: string;
  readonly workflowAppClientId?: string;
}

interface RevisableOptions {
  readonly client: GitHubClient;
  readonly repo: string;
  readonly pullRequest: number;
  readonly baseBranch: string;
  readonly workflowAppClientId: string;
}

export interface GatedRevise {
  readonly head: string;
  readonly ordinal: number;
  readonly merge: boolean;
  readonly items: readonly string[];
}

const maxListedConflicts = 10;

type Pull = z.infer<typeof revisePullSchema>;

function renderPullRequest(pull: Pull): string {
  const body = (pull.body ?? '').trim();
  return [
    `# ${pull.title}`,
    '',
    `${pull.html_url} · branch \`${pull.head.ref}\` at \`${pull.head.sha}\` · ${pull.draft ? 'draft' : 'ready for review'}`,
    '',
    '## Description',
    '',
    body === '' ? '(empty)' : body,
    '',
  ].join('\n');
}

function refusal(pull: Pull, reason: string): Error {
  return new Error(`#${pull.number} cannot be revised: ${reason}`);
}

function revisableIssue(pull: Pull, repo: string, baseBranch: string): number {
  if (pull.state !== 'open') throw refusal(pull, 'it is not open');
  if (pull.head.repo?.full_name !== repo) throw refusal(pull, 'it comes from another repository');
  if (pull.base.ref !== baseBranch) throw refusal(pull, `it does not target ${baseBranch}`);
  const issue = issueOfBranch(pull.head.ref);
  if (issue === null) throw refusal(pull, `${pull.head.ref} is not a fix-issue branch`);
  if (pull.user?.type !== botAccountType) {
    throw refusal(pull, 'it was not opened by the fix-issue App');
  }
  return issue;
}

export async function fetchRevisable({
  client,
  repo,
  pullRequest,
  baseBranch,
  workflowAppClientId,
}: RevisableOptions) {
  const pull = revisePullSchema.parse(
    await client.request('GET', `repos/${repo}/pulls/${pullRequest}`)
  );
  const issue = revisableIssue(pull, repo, baseBranch);
  const fromApp = z
    .array(commentSchema)
    .parse(await paginate(client, `repos/${repo}/issues/${pullRequest}/comments`))
    .filter(comment => isWorkflowAppComment(comment, workflowAppClientId));
  const revises = fromApp.filter(comment => isReviseSummary(comment.body)).length;
  return { pull, issue, fromApp, ordinal: revises + 1 };
}

function listed(files: readonly string[]): string {
  const shown = files.slice(0, maxListedConflicts).map(file => `\`${file}\``);
  const rest = files.length - shown.length;
  return rest > 0 ? `${shown.join(', ')} and ${rest} more` : shown.join(', ');
}

export async function gateRevise({
  client,
  repo,
  paths,
  pullRequest,
  devSha,
  baseBranch,
  mergeRequested,
  instructions,
  requestedBy,
  workflowAppClientId,
}: GateOptions): Promise<GatedRevise> {
  if (!workflowAppClientId) throw new Error('the client ID of the fix-issue App is not set');
  const { pull, issue, fromApp, ordinal } = await fetchRevisable({
    client,
    repo,
    pullRequest,
    baseBranch,
    workflowAppClientId,
  });
  if (ordinal > maxRevises) {
    throw new Error(
      `#${pullRequest} has already been revised ${maxRevises} times, the most a pull request gets; take the branch over by hand, or dispatch the issue again with the review in the brief`
    );
  }

  ensureCommit(paths.root, pull.head.sha);
  const plan = planMerge(paths.root, pull.head.sha, devSha, mergeRequested);
  const forbidden = refusedPaths(plan.conflicts);
  if (forbidden.length > 0) {
    throw new Error(
      `dev conflicts with ${pull.head.ref} in ${listed(forbidden)}, which fix-issue may never change; merge dev into the branch by hand first`
    );
  }

  const text = instructions.trim();
  const feedback =
    text === '' && plan.onlyMerge
      ? { threads: [], reviews: [], omitted: 0 }
      : await fetchFeedback({ client, repo, pullRequest, head: pull.head.sha });
  const feedbackItems = [...feedback.threads, ...feedback.reviews].map(item => item.id);
  if (text === '' && feedbackItems.length === 0 && !plan.onlyMerge) {
    throw new Error(
      `there is nothing to revise on #${pullRequest}: no notes, no unresolved review thread, no review summary on its head commit, and no conflict with dev`
    );
  }

  mkdirSync(paths.workDir, { recursive: true });
  await fetchIssue({ client, repo, issue, outFile: paths.issueFile, workflowAppClientId });
  const brief = fromApp.filter(comment => isBriefComment(comment.body)).at(-1)?.body ?? null;
  writeFileSync(paths.notesFile, `${brief === null ? '' : (extractBrief(brief) ?? '')}\n`);
  writeFileSync(paths.pullRequestFile, renderPullRequest(pull));
  writeFileSync(
    paths.feedbackFile,
    renderFeedback({
      pullRequest,
      ordinal,
      requestedBy,
      instructions: text,
      merge: plan.merge ? { dev: devSha, conflicts: plan.conflicts } : null,
      threads: feedback.threads,
      reviews: feedback.reviews,
      omitted: feedback.omitted,
    })
  );
  return {
    head: pull.head.sha,
    ordinal,
    merge: plan.merge,
    items: [
      ...(text === '' ? [] : [instructionsItemId]),
      ...(plan.merge ? [mergeItemId] : []),
      ...feedbackItems,
    ],
  };
}
