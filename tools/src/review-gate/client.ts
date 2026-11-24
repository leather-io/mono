import { z } from 'zod';

import { type GitHubClient, GitHubError, type HttpMethod, paginate } from '../ci/github.js';
import {
  type Review,
  type WorkflowRun,
  commitPullRequestSchema,
  pullRequestSchema,
  reviewsPageSchema,
  workflowRunSchema,
  workflowRunsPageSchema,
} from './schemas.js';

const notFoundStatus = 404;
const maxReviewPages = 30;
const fixIssueWorkflowFile = 'repo:fix-issue.yml';
const runsPageSize = 100;
const maxRunPages = 10;
const reviewsQuery = `
  query ($owner: String!, $name: String!, $number: Int!, $after: String) {
    repository(owner: $owner, name: $name) {
      pullRequest(number: $number) {
        reviews(first: 100, after: $after) {
          nodes {
            state
            author {
              login
              __typename
            }
            commit {
              oid
            }
            onBehalfOf(first: 20) {
              nodes {
                databaseId
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    }
  }
`;

interface NewStatus {
  readonly state: 'success' | 'failure' | 'error';
  readonly context: string;
  readonly description: string;
  readonly target_url: string;
}

export function createGateClient(github: GitHubClient, repository: string) {
  const repoPath = `repos/${repository}`;

  function request(path: string, method: HttpMethod = 'GET', body?: unknown): Promise<unknown> {
    return github.request(method, `${repoPath}${path}`, body);
  }

  return {
    async getPullRequest(number: number) {
      return pullRequestSchema.parse(await request(`/pulls/${number}`));
    },
    async listCommitPullRequests(sha: string) {
      const pullRequests = await paginate(github, `${repoPath}/commits/${sha}/pulls`);
      return z.array(commitPullRequestSchema).parse(pullRequests);
    },
    async createStatus(sha: string, status: NewStatus): Promise<void> {
      await request(`/statuses/${sha}`, 'POST', status);
    },
    async getWorkflowRun(id: string) {
      try {
        return workflowRunSchema.parse(await request(`/actions/runs/${id}`));
      } catch (error) {
        if (error instanceof GitHubError && error.status === notFoundStatus) return null;
        throw error;
      }
    },
    async listFixIssueDispatches(since: string): Promise<WorkflowRun[]> {
      const runs: WorkflowRun[] = [];
      for (let page = 1; page <= maxRunPages; page += 1) {
        const query = `event=workflow_dispatch&created=${encodeURIComponent(`>=${since}`)}&per_page=${runsPageSize}&page=${page}`;
        const { workflow_runs: entries } = workflowRunsPageSchema.parse(
          await request(`/actions/workflows/${fixIssueWorkflowFile}/runs?${query}`)
        );
        runs.push(...entries);
        if (entries.length < runsPageSize) return runs;
      }
      throw new Error(`more than ${maxRunPages * runsPageSize} fix-issue runs since ${since}`);
    },
    async listReviews(number: number): Promise<Review[]> {
      const [owner, name] = repository.split('/');
      const reviews: Review[] = [];
      let after: string | null = null;
      for (let page = 1; page <= maxReviewPages; page += 1) {
        const data: unknown = await github.graphql(reviewsQuery, { owner, name, number, after });
        const { nodes, pageInfo } = reviewsPageSchema.parse(data).repository.pullRequest.reviews;
        reviews.push(...nodes);
        if (!pageInfo.hasNextPage) break;
        after = pageInfo.endCursor;
      }
      return reviews;
    },
  };
}
