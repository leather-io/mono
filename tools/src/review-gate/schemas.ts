import { z } from 'zod';

const loginSchema = z.object({ login: z.string() });

export const pullRequestSchema = z.object({
  number: z.number(),
  state: z.string(),
  user: z.object({ login: z.string(), type: z.string() }),
  head: z.object({ sha: z.string(), ref: z.string() }),
  base: z.object({ ref: z.string() }),
});
export type PullRequest = z.infer<typeof pullRequestSchema>;

const reviewSchema = z.object({
  state: z.string(),
  author: z.object({ login: z.string(), __typename: z.string() }).nullable(),
  commit: z.object({ oid: z.string() }).nullable(),
  onBehalfOf: z.object({
    nodes: z.array(z.object({ databaseId: z.number().nullable() }).nullable()),
  }),
});
export type Review = z.infer<typeof reviewSchema>;

export const commitPullRequestSchema = z.object({
  number: z.number(),
  state: z.string(),
  head: z.object({ sha: z.string() }),
});
export type CommitPullRequest = z.infer<typeof commitPullRequestSchema>;

export const workflowRunSchema = z.object({
  path: z.string(),
  event: z.string(),
  display_title: z.string(),
  actor: loginSchema.nullish(),
  triggering_actor: loginSchema.nullish(),
});
export type WorkflowRun = z.infer<typeof workflowRunSchema>;

export const reviewsPageSchema = z.object({
  repository: z.object({
    pullRequest: z.object({
      reviews: z.object({
        nodes: z.array(reviewSchema),
        pageInfo: z.object({ hasNextPage: z.boolean(), endCursor: z.string().nullable() }),
      }),
    }),
  }),
});
