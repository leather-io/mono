import { mkdirSync, writeFileSync } from 'node:fs';
import { z } from 'zod';

import { extractBrief, isBriefComment } from './brief.js';
import { fetchFeedback, instructionsItemId, mergeItemId, renderFeedback } from './feedback.js';
import { refusedPaths } from './git.js';
import { type GitHubClient, paginate } from './github.js';
import { commentSchema, fetchIssue, isWorkflowAppComment } from './issue.js';
import { ensureCommit, planMerge } from './merge.js';
import type { FixIssuePaths } from './paths.js';
import {
  type ReviseItem,
  type ReviseState,
  isReviseSummary,
  issueOfBranch,
  maxRevises,
  writeReviseState,
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

const botType = 'Bot';
const maxListedConflicts = 10;

const pullSchema = z.object({
  state: z.string(),
  draft: z.boolean(),
  title: z.string(),
  body: z.string().nullable(),
  html_url: z.string(),
  user: z.object({ login: z.string(), type: z.string().optional() }).nullable(),
  head: z.object({
    ref: z.string(),
    sha: z.string(),
    repo: z.object({ full_name: z.string() }).nullable(),
  }),
  base: z.object({ ref: z.string() }),
});

type Pull = z.infer<typeof pullSchema>;

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

function pullProblem(pull: Pull, repo: string, baseBranch: string): string | null {
  if (pull.state !== 'open') return 'it is not open';
  if (pull.head.repo?.full_name !== repo) return 'it comes from another repository';
  if (pull.base.ref !== baseBranch) return `it does not target ${baseBranch}`;
  if (issueOfBranch(pull.head.ref) === null) return `${pull.head.ref} is not a fix-issue branch`;
  if (pull.user?.type !== botType) return 'it was not opened by the fix-issue App';
  return null;
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
}: GateOptions): Promise<ReviseState> {
  if (!workflowAppClientId) throw new Error('the client ID of the fix-issue App is not set');
  const pull = pullSchema.parse(await client.request('GET', `repos/${repo}/pulls/${pullRequest}`));
  const problem = pullProblem(pull, repo, baseBranch);
  const issue = issueOfBranch(pull.head.ref);
  if (problem !== null || issue === null) {
    throw new Error(`#${pullRequest} cannot be revised: ${problem ?? 'it has no issue'}`);
  }

  const fromApp = z
    .array(commentSchema)
    .parse(await paginate(client, `repos/${repo}/issues/${pullRequest}/comments`))
    .filter(comment => isWorkflowAppComment(comment, workflowAppClientId));
  const revises = fromApp.filter(comment => isReviseSummary(comment.body)).length;
  if (revises >= maxRevises) {
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
  const instructionItems: ReviseItem[] =
    text === '' ? [] : [{ id: instructionsItemId, kind: 'instructions' }];
  const mergeItems: ReviseItem[] = plan.merge ? [{ id: mergeItemId, kind: 'merge' }] : [];
  const feedbackItems: ReviseItem[] = [
    ...feedback.threads.map((thread): ReviseItem => ({ id: thread.id, kind: 'thread' })),
    ...feedback.reviews.map((review): ReviseItem => ({ id: review.id, kind: 'review' })),
  ];
  if (instructionItems.length + feedbackItems.length === 0 && !plan.onlyMerge) {
    throw new Error(
      `there is nothing to revise on #${pullRequest}: no notes, no unresolved review thread, no review summary on its head commit, and no conflict with dev`
    );
  }

  const ordinal = revises + 1;
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
  const state: ReviseState = {
    pullRequest,
    issue,
    branch: pull.head.ref,
    head: pull.head.sha,
    dev: devSha,
    ordinal,
    merge: plan.merge,
    conflicts: [...plan.conflicts],
    items: [...instructionItems, ...mergeItems, ...feedbackItems],
  };
  writeReviseState(paths.reviseFile, state);
  return state;
}
