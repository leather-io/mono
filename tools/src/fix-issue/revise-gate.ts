import { mkdirSync, writeFileSync } from 'node:fs';
import { z } from 'zod';

import { runOrThrow } from '../ci/exec.js';
import { type GitHubClient, paginate } from '../ci/github.js';
import { extractBrief, isBriefComment } from './brief.js';
import { refusedPaths } from './git.js';
import { commentSchema, fetchIssue, isWorkflowAppComment } from './issue.js';
import { ensureCommit, mergeBase, mergeDev, planMerge } from './merge.js';
import type { FixIssuePaths } from './paths.js';
import {
  type ReviseState,
  botAccountType,
  isReviseSummary,
  issueOfBranch,
  maxRevises,
  revisePullSchema,
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

interface RevisableOptions {
  readonly client: GitHubClient;
  readonly repo: string;
  readonly pullRequest: number;
  readonly baseBranch: string;
  readonly workflowAppClientId: string;
}

interface StartedRevise extends ReviseState {
  readonly ordinal: number;
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

function mergeSection(dev: string, conflicts: readonly string[]): string {
  const intro = `The workflow merged \`dev\` at \`${dev}\` into the pull request branch before you started.`;
  if (conflicts.length === 0) {
    return `## \`dev\` was merged into the branch\n\n${intro} The merge had no conflicts. Check that the change still does its job against the newer code on \`dev\`.`;
  }
  return `## \`dev\` was merged into the branch and conflicts\n\n${intro} These files conflict; resolve every one:\n\n${conflicts.map(file => `- \`${file}\``).join('\n')}`;
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
}: GateOptions): Promise<StartedRevise> {
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
  if (text === '' && !plan.onlyMerge) {
    throw new Error(
      `there is nothing to revise on #${pullRequest}: no notes and no conflict with dev`
    );
  }

  mkdirSync(paths.workDir, { recursive: true });
  await fetchIssue({ client, repo, issue, outFile: paths.issueFile, workflowAppClientId });
  const brief = fromApp.filter(comment => isBriefComment(comment.body)).at(-1)?.body ?? null;
  writeFileSync(paths.notesFile, `${brief === null ? '' : (extractBrief(brief) ?? '')}\n`);
  writeFileSync(paths.pullRequestFile, renderPullRequest(pull));
  const sections = [
    `# Feedback on pull request #${pullRequest}\n\nRevise ${ordinal} of ${maxRevises}, asked for by @${requestedBy}. The status file needs one line under \`answers\` per thing asked for below.`,
    ...(text === '' ? [] : [`## What @${requestedBy} asked for\n\n${text}`]),
    ...(plan.merge ? [mergeSection(devSha, plan.conflicts)] : []),
  ];
  writeFileSync(paths.feedbackFile, `${sections.join('\n\n')}\n`);

  runOrThrow('git', ['checkout', '--quiet', '--detach', pull.head.sha], { cwd: paths.root });
  const conflicts = plan.merge ? mergeDev(paths.root, devSha) : [];
  const since = mergeBase(paths.root, 'HEAD', devSha);
  writeFileSync(
    paths.pullRequestDiff,
    runOrThrow('git', ['diff', '--no-renames', since, 'HEAD'], { cwd: paths.root })
  );
  const state: ReviseState = { head: pull.head.sha, merge: plan.merge, conflicts, since };
  writeReviseState(paths.reviseFile, state);
  return { ...state, ordinal };
}
