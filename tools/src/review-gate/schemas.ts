import { z } from 'zod';

const loginSchema = z.object({ login: z.string() });

export const pullRequestFileSchema = z.object({
  filename: z.string(),
  previous_filename: z.string().optional(),
  status: z.string(),
  additions: z.number(),
  deletions: z.number(),
  patch: z.string().optional(),
  sha: z.string().nullish(),
});
export type PullRequestFile = z.infer<typeof pullRequestFileSchema>;

export const pullRequestSchema = z.object({
  number: z.number(),
  state: z.string(),
  title: z.string(),
  body: z.string().nullable(),
  user: z.object({ login: z.string(), type: z.string() }),
  head: z.object({
    sha: z.string(),
    ref: z.string(),
    repo: z.object({ full_name: z.string() }).nullable(),
  }),
  base: z.object({ sha: z.string(), ref: z.string() }),
});
export type PullRequest = z.infer<typeof pullRequestSchema>;

export const reviewSchema = z.object({
  id: z.number(),
  user: z.object({ login: z.string(), type: z.string() }).nullable(),
  state: z.string(),
  commit_id: z.string().nullable(),
});
export type Review = z.infer<typeof reviewSchema>;

export const commitStatusSchema = z.object({
  context: z.string(),
  state: z.string(),
  description: z.string().nullable(),
  creator: loginSchema.nullable(),
});
export type CommitStatus = z.infer<typeof commitStatusSchema>;

export const commitPullRequestSchema = z.object({
  number: z.number(),
  state: z.string(),
  head: z.object({ sha: z.string() }),
});
export type CommitPullRequest = z.infer<typeof commitPullRequestSchema>;

export const issueCommentSchema = z.object({
  id: z.number(),
  user: loginSchema.nullable(),
  body: z.string().optional(),
});
export type IssueComment = z.infer<typeof issueCommentSchema>;

export const permissionSchema = z.object({ permission: z.string() });
export type Permission = z.infer<typeof permissionSchema>;

export const workflowRunSchema = z.object({
  path: z.string(),
  event: z.string(),
  display_title: z.string(),
  html_url: z.string(),
  actor: loginSchema.nullish(),
  triggering_actor: loginSchema.nullish(),
});
export type WorkflowRun = z.infer<typeof workflowRunSchema>;

export const branchRulesSchema = z.array(
  z.object({
    type: z.string(),
    parameters: z
      .object({
        required_reviewers: z
          .array(z.object({ reviewer: z.object({ id: z.number(), type: z.string() }) }))
          .optional(),
      })
      .nullish(),
  })
);

export const teamReviewsSchema = z.object({
  repository: z.object({
    pullRequest: z.object({
      reviews: z.object({
        nodes: z.array(
          z.object({
            databaseId: z.number().nullable(),
            onBehalfOf: z.object({
              nodes: z.array(z.object({ databaseId: z.number().nullable() }).nullable()),
            }),
          })
        ),
        pageInfo: z.object({ hasNextPage: z.boolean(), endCursor: z.string().nullable() }),
      }),
    }),
  }),
});

export const treeSchema = z.object({
  truncated: z.boolean(),
  tree: z.array(z.object({ path: z.string(), type: z.string(), sha: z.string() })),
});
