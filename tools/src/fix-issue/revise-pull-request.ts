import { z } from 'zod';

import { fetchFeedback, instructionsItemId, mergeItemId } from './feedback.js';
import { type GitHubClient, graphqlData, paginate } from './github.js';
import { ensureCommit, planMerge } from './merge.js';
import type { FixIssuePaths } from './paths.js';
import {
  isReviseSummary,
  issueOfBranch,
  maxRevises,
  readReviseState,
  reviseMarker,
} from './revise-state.js';
import type { FixStatus } from './status.js';

interface ReviseTargetOptions {
  readonly client: GitHubClient;
  readonly paths: FixIssuePaths;
  readonly repo: string;
  readonly pullRequest: number;
  readonly devSha: string;
  readonly baseBranch: string;
  readonly mergeRequested: boolean;
  readonly appLogin: string;
}

export interface ReviseTarget {
  readonly number: number;
  readonly nodeId: string;
  readonly htmlUrl: string;
  readonly draft: boolean;
  readonly body: string | null;
  readonly branch: string;
  readonly head: string;
  readonly issue: number;
  readonly merge: boolean;
  readonly ordinal: number;
}

interface AnswerOptions {
  readonly client: GitHubClient;
  readonly repo: string;
  readonly pullRequest: number;
  readonly head: string;
  readonly status: FixStatus;
  readonly resolve: boolean;
  log(line: string): void;
}

interface FeedbackAnswers {
  readonly threads: number;
  readonly answered: number;
  readonly resolved: number;
  readonly leftOpen: number;
  readonly reviewers: readonly string[];
}

interface SummaryOptions {
  readonly ordinal: number;
  readonly status: FixStatus;
  readonly commit: string | null;
  readonly mergedDev: string | null;
  readonly answers: FeedbackAnswers;
  readonly requestedBy?: string;
  readonly request?: string;
  readonly runUrl: string | null;
}

const pullSchema = z.object({
  number: z.number(),
  state: z.string(),
  draft: z.boolean(),
  node_id: z.string(),
  html_url: z.string(),
  body: z.string().nullable(),
  user: z.object({ login: z.string() }).nullable(),
  head: z.object({
    ref: z.string(),
    sha: z.string(),
    repo: z.object({ full_name: z.string() }).nullable(),
  }),
  base: z.object({ ref: z.string() }),
});
const commentAuthorsSchema = z.array(
  z.object({ body: z.string().nullable(), user: z.object({ login: z.string() }).nullable() })
);
const mutationSchema = z.unknown();

const shortShaLength = 12;
const screenshotsHeading = '## Screenshots';
const threadPrefix = 'thread-';
const reviewPrefix = 'review-';

const replyMutation =
  'mutation($thread: ID!, $body: String!) { addPullRequestReviewThreadReply(input: { pullRequestReviewThreadId: $thread, body: $body }) { clientMutationId } }';
const resolveMutation =
  'mutation($thread: ID!) { resolveReviewThread(input: { threadId: $thread }) { clientMutationId } }';

export const noAnswers: FeedbackAnswers = {
  threads: 0,
  answered: 0,
  resolved: 0,
  leftOpen: 0,
  reviewers: [],
};

function message(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function shortSha(sha: string): string {
  return sha.slice(0, shortShaLength);
}

function bullets(lines: readonly string[]): string {
  return lines.map(line => `- ${line}`).join('\n');
}

export async function readReviseTarget({
  client,
  paths,
  repo,
  pullRequest,
  devSha,
  baseBranch,
  mergeRequested,
  appLogin,
}: ReviseTargetOptions): Promise<ReviseTarget> {
  const pull = pullSchema.parse(await client.request('GET', `repos/${repo}/pulls/${pullRequest}`));
  if (pull.state !== 'open') throw new Error(`#${pullRequest} is no longer open`);
  if (pull.head.repo?.full_name !== repo || pull.base.ref !== baseBranch) {
    throw new Error(`#${pullRequest} is not a pull request of ${repo} into ${baseBranch}`);
  }
  if (pull.user?.login !== appLogin) {
    throw new Error(`#${pullRequest} was not opened by ${appLogin}`);
  }
  const issue = issueOfBranch(pull.head.ref);
  if (issue === null) throw new Error(`${pull.head.ref} is not a fix-issue branch`);
  const revised = readReviseState(paths.reviseFile)?.head;
  if (revised !== pull.head.sha) {
    throw new Error(
      `${pull.head.ref} is at ${pull.head.sha}, not at the commit the fixer revised (${revised ?? 'unknown'}); dispatch the revise again`
    );
  }
  ensureCommit(paths.root, pull.head.sha);
  const comments = commentAuthorsSchema.parse(
    await paginate(client, `repos/${repo}/issues/${pullRequest}/comments`)
  );
  const revises = comments.filter(
    comment => comment.user?.login === appLogin && isReviseSummary(comment.body)
  ).length;
  return {
    number: pull.number,
    nodeId: pull.node_id,
    htmlUrl: pull.html_url,
    draft: pull.draft,
    body: pull.body,
    branch: pull.head.ref,
    head: pull.head.sha,
    issue,
    merge: planMerge(paths.root, pull.head.sha, devSha, mergeRequested).merge,
    ordinal: revises + 1,
  };
}

export function unresolvedQuestion(files: readonly string[]): string {
  return `The merge of dev left conflict markers in ${files.map(file => `\`${file}\``).join(', ')}, so nothing was committed. Options: resolve them on the branch by hand; dispatch the revise again with notes on how to resolve them.`;
}

export function carriedScreenshots(body: string | null, ordinal: number): string | null {
  const text = body ?? '';
  const start = text.indexOf(`${screenshotsHeading}\n`);
  if (start === -1) return null;
  const rest = text.slice(start + screenshotsHeading.length);
  const next = rest.search(/\n## /);
  const table = (next === -1 ? rest : rest.slice(0, next))
    .split('\n')
    .filter(line => line.startsWith('|'))
    .join('\n');
  if (table === '') return null;
  return `${table}\n\nCaptured before revise ${ordinal}; what it changed is not shown.`;
}

export async function answerFeedback({
  client,
  repo,
  pullRequest,
  head,
  status,
  resolve,
  log,
}: AnswerOptions): Promise<FeedbackAnswers> {
  const feedback = await fetchFeedback({ client, repo, pullRequest, head });
  const answersById = new Map(status.feedback.map(entry => [entry.id, entry]));
  const answers = feedback.threads.flatMap(thread => {
    const answer = answersById.get(thread.id);
    return answer === undefined ? [] : [{ thread, answer }];
  });
  let answered = 0;
  let resolved = 0;
  for (const { thread, answer } of answers) {
    try {
      await graphqlData(client, mutationSchema, replyMutation, {
        thread: thread.nodeId,
        body: answer.reply,
      });
      answered += 1;
      if (resolve && answer.addressed) {
        await graphqlData(client, mutationSchema, resolveMutation, { thread: thread.nodeId });
        resolved += 1;
      }
    } catch (error) {
      log(`open-pull-request: could not answer ${thread.id}: ${message(error)}`);
    }
  }
  const reviewers = [
    ...answers.flatMap(({ thread }) => thread.comments.slice(0, 1).map(comment => comment.author)),
    ...feedback.reviews.filter(review => answersById.has(review.id)).map(review => review.author),
  ];
  return {
    threads: answers.length,
    answered,
    resolved,
    leftOpen: feedback.threads.length - answers.length,
    reviewers: [...new Set(reviewers)],
  };
}

function quoted(text: string): string {
  return text
    .trim()
    .split('\n')
    .map(line => (line === '' ? '>' : `> ${line}`))
    .join('\n');
}

function answerLine(entry: FixStatus['feedback'][number]): string | null {
  if (entry.id === instructionsItemId) return `What was asked: ${entry.reply}`;
  if (entry.id === mergeItemId) return `Merge of \`dev\`: ${entry.reply}`;
  if (entry.id.startsWith(reviewPrefix)) return `Review \`${entry.id}\`: ${entry.reply}`;
  return null;
}

export function renderReviseSummary({
  ordinal,
  status,
  commit,
  mergedDev,
  answers,
  requestedBy,
  request,
  runUrl,
}: SummaryOptions): string {
  const by = requestedBy ? `, asked for by @${requestedBy}` : '';
  const run = runUrl ? ` ([run](${runUrl}))` : '';
  const merged = mergedDev ? `, merging \`dev\` at ${shortSha(mergedDev)}` : '';
  const lines = status.feedback
    .filter(entry => !entry.id.startsWith(threadPrefix))
    .map(answerLine)
    .filter(line => line !== null);
  if (answers.threads > 0) {
    lines.push(
      `Review threads: ${answers.answered} of ${answers.threads} answered, ${answers.resolved} resolved.`
    );
  }
  if (answers.leftOpen > 0) {
    lines.push(
      `${answers.leftOpen} unresolved review threads were not part of this revise; dispatch another one to have them addressed.`
    );
  }
  const parts = [reviseMarker(ordinal), `**Revise ${ordinal} of ${maxRevises}**${by}${run}.`];
  if (request !== undefined && request.trim() !== '') parts.push(quoted(request));
  parts.push(
    commit
      ? `Committed ${shortSha(commit)} (\`${status.commit}\`)${merged}.`
      : 'Nothing was committed to the branch.'
  );
  if (lines.length > 0) parts.push(bullets(lines));
  if (status.state === 'blocked' && status.questions.length > 0) {
    parts.push(
      `It needs answers before it can go on, so the pull request is a draft:\n\n${bullets(status.questions)}`
    );
  }
  return `${parts.join('\n\n')}\n`;
}
