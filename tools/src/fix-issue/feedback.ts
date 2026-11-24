import { z } from 'zod';

import { type GitHubClient, graphqlData, paginate } from './github.js';
import { trustedAuthors } from './issue.js';
import { maxRevises } from './revise-state.js';

interface FeedbackComment {
  readonly author: string;
  readonly createdAt: string;
  readonly body: string;
}

interface FeedbackThread {
  readonly id: string;
  readonly nodeId: string;
  readonly path: string;
  readonly line: number | null;
  readonly outdated: boolean;
  readonly comments: readonly FeedbackComment[];
}

interface FeedbackReview {
  readonly id: string;
  readonly author: string;
  readonly state: string;
  readonly submittedAt: string;
  readonly body: string;
}

interface Feedback {
  readonly threads: readonly FeedbackThread[];
  readonly reviews: readonly FeedbackReview[];
  readonly omitted: number;
}

interface FetchFeedbackOptions {
  readonly client: GitHubClient;
  readonly repo: string;
  readonly pullRequest: number;
  readonly head: string;
}

interface MergeNote {
  readonly dev: string;
  readonly conflicts: readonly string[];
}

interface RenderFeedbackOptions {
  readonly pullRequest: number;
  readonly ordinal: number;
  readonly requestedBy: string;
  readonly instructions: string;
  readonly merge: MergeNote | null;
  readonly threads: readonly FeedbackThread[];
  readonly reviews: readonly FeedbackReview[];
  readonly omitted: number;
}

export const instructionsItemId = 'instructions';
export const mergeItemId = 'merge';

const threadsPageSize = 50;
const maxThreadPages = 10;
const userType = 'User';
const reviewStates: Readonly<Record<string, string>> = {
  CHANGES_REQUESTED: 'changes requested',
  COMMENTED: 'commented',
  APPROVED: 'approved',
};

const threadsQuery = `query($owner: String!, $name: String!, $number: Int!, $cursor: String) {
  repository(owner: $owner, name: $name) {
    pullRequest(number: $number) {
      reviewThreads(first: ${threadsPageSize}, after: $cursor) {
        pageInfo { hasNextPage endCursor }
        nodes {
          id
          isResolved
          isOutdated
          path
          line
          originalLine
          comments(first: ${threadsPageSize}) {
            nodes { databaseId body createdAt author { __typename login } }
          }
        }
      }
    }
  }
}`;

const threadSchema = z.object({
  id: z.string(),
  isResolved: z.boolean(),
  isOutdated: z.boolean(),
  path: z.string(),
  line: z.number().nullable(),
  originalLine: z.number().nullable(),
  comments: z.object({
    nodes: z.array(
      z.object({
        databaseId: z.number().nullable(),
        body: z.string(),
        createdAt: z.string(),
        author: z.object({ __typename: z.string(), login: z.string() }).nullable(),
      })
    ),
  }),
});

const threadsSchema = z.object({
  repository: z.object({
    pullRequest: z.object({
      reviewThreads: z.object({
        pageInfo: z.object({ hasNextPage: z.boolean(), endCursor: z.string().nullable() }),
        nodes: z.array(threadSchema),
      }),
    }),
  }),
});

const reviewSchema = z.object({
  id: z.number(),
  user: z.object({ login: z.string(), type: z.string().optional() }).nullable(),
  body: z.string().nullable(),
  state: z.string(),
  commit_id: z.string().nullable().optional(),
  submitted_at: z.string().nullable().optional(),
});

type RawThread = z.infer<typeof threadSchema>;

interface OpenThread {
  readonly id: string;
  readonly thread: RawThread;
}

function threadItemId(thread: RawThread): string | null {
  const first = thread.comments.nodes[0]?.databaseId;
  return first === null || first === undefined ? null : `thread-${first}`;
}

export async function fetchOpenThreads(
  client: GitHubClient,
  repo: string,
  pullRequest: number
): Promise<OpenThread[]> {
  const [owner, name] = repo.split('/');
  const threads: OpenThread[] = [];
  let cursor: string | null = null;
  for (let page = 0; page < maxThreadPages; page += 1) {
    const data: z.infer<typeof threadsSchema> = await graphqlData(
      client,
      threadsSchema,
      threadsQuery,
      { owner, name, number: pullRequest, cursor }
    );
    const { nodes, pageInfo } = data.repository.pullRequest.reviewThreads;
    for (const thread of nodes) {
      const id = threadItemId(thread);
      if (!thread.isResolved && id !== null) threads.push({ id, thread });
    }
    if (!pageInfo.hasNextPage) break;
    cursor = pageInfo.endCursor;
  }
  return threads;
}

function isUser(type: string | undefined): boolean {
  return type === userType;
}

export async function fetchFeedback({
  client,
  repo,
  pullRequest,
  head,
}: FetchFeedbackOptions): Promise<Feedback> {
  const open = await fetchOpenThreads(client, repo, pullRequest);
  const reviews = z
    .array(reviewSchema)
    .parse(await paginate(client, `repos/${repo}/pulls/${pullRequest}/reviews`))
    .filter(
      review =>
        reviewStates[review.state] !== undefined &&
        (review.body ?? '').trim() !== '' &&
        review.commit_id === head
    );
  const threadComments = open.flatMap(({ thread }) => thread.comments.nodes);
  const trusted = await trustedAuthors(client, repo, [
    ...threadComments.map(comment =>
      comment.author && isUser(comment.author.__typename) ? comment.author.login : null
    ),
    ...reviews.map(review => (review.user && isUser(review.user.type) ? review.user.login : null)),
  ]);
  const threads = open
    .map(({ id, thread }) => ({
      id,
      nodeId: thread.id,
      path: thread.path,
      line: thread.line ?? thread.originalLine,
      outdated: thread.isOutdated,
      comments: thread.comments.nodes.flatMap(comment =>
        comment.author && isUser(comment.author.__typename) && trusted.has(comment.author.login)
          ? [{ author: comment.author.login, createdAt: comment.createdAt, body: comment.body }]
          : []
      ),
    }))
    .filter(thread => thread.comments.length > 0);
  const keptReviews = reviews.flatMap(review =>
    review.user && isUser(review.user.type) && trusted.has(review.user.login)
      ? [
          {
            id: `review-${review.id}`,
            author: review.user.login,
            state: review.state,
            submittedAt: review.submitted_at ?? '',
            body: (review.body ?? '').trim(),
          },
        ]
      : []
  );
  const keptComments = threads.reduce((count, thread) => count + thread.comments.length, 0);
  return {
    threads,
    reviews: keptReviews,
    omitted: threadComments.length - keptComments + (reviews.length - keptReviews.length),
  };
}

function renderMerge({ dev, conflicts }: MergeNote): string[] {
  const intro = `The workflow merged \`dev\` at \`${dev}\` into the pull request branch before you started.`;
  if (conflicts.length === 0) {
    return [
      `## \`${mergeItemId}\`: \`dev\` was merged into the branch`,
      '',
      `${intro} The merge had no conflicts. Check that the change still does its job against the newer code on \`dev\`.`,
    ];
  }
  return [
    `## \`${mergeItemId}\`: \`dev\` was merged into the branch and conflicts`,
    '',
    `${intro} These files conflict; resolve every one:`,
    '',
    ...conflicts.map(file => `- \`${file}\``),
  ];
}

function renderThread(thread: FeedbackThread): string[] {
  const where = thread.line === null ? thread.path : `${thread.path} line ${thread.line}`;
  const outdated = thread.outdated
    ? ['', 'The code under this thread changed after the comment was written.']
    : [];
  return [
    `## \`${thread.id}\`: review thread on \`${where}\``,
    ...outdated,
    ...thread.comments.flatMap(comment => [
      '',
      `**@${comment.author}** on ${comment.createdAt}:`,
      '',
      comment.body.trim() === '' ? '(empty)' : comment.body.trim(),
    ]),
  ];
}

function renderReview(review: FeedbackReview): string[] {
  return [
    `## \`${review.id}\`: review by @${review.author} (${reviewStates[review.state] ?? review.state})`,
    '',
    review.body,
  ];
}

export function renderFeedback({
  pullRequest,
  ordinal,
  requestedBy,
  instructions,
  merge,
  threads,
  reviews,
  omitted,
}: RenderFeedbackOptions): string {
  const sections: string[][] = [
    [
      `# Feedback on pull request #${pullRequest}`,
      '',
      `Revise ${ordinal} of ${maxRevises}, asked for by @${requestedBy}. Every section below is one item with an id; the status file needs one \`feedback\` entry per id.`,
    ],
  ];
  if (instructions !== '') {
    sections.push([
      `## \`${instructionsItemId}\`: what @${requestedBy} asked for`,
      '',
      instructions,
    ]);
  }
  if (merge) sections.push(renderMerge(merge));
  sections.push(...threads.map(renderThread), ...reviews.map(renderReview));
  if (omitted > 0) {
    sections.push([
      `${omitted} review comments from people without write access to the repository were omitted.`,
    ]);
  }
  return `${sections.map(section => section.join('\n')).join('\n\n')}\n`;
}
