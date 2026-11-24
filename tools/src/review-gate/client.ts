import { z } from 'zod';

import { type GitHubClient, GitHubError, type HttpMethod, paginate } from '../ci/github.js';
import {
  type Review,
  commitPullRequestSchema,
  commitStatusSchema,
  pullRequestFileSchema,
  pullRequestSchema,
  reviewsPageSchema,
  treeSchema,
  viewerSchema,
  workflowRunSchema,
} from './schemas.js';

const notFoundStatus = 404;
const maxReviewPages = 30;
const viewerQuery = 'query { viewer { login } }';
const botLoginSuffix = '[bot]';
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
  readonly state: 'pending' | 'success' | 'failure' | 'error';
  readonly context: string;
  readonly description: string;
  readonly target_url: string;
}

export function createGateClient(github: GitHubClient, repository: string) {
  const repoPath = `repos/${repository}`;

  function request(path: string, method: HttpMethod = 'GET', body?: unknown): Promise<unknown> {
    return github.request(method, `${repoPath}${path}`, body);
  }

  async function listAll<T extends z.ZodType>(path: string, schema: T): Promise<z.infer<T>[]> {
    return z.array(schema).parse(await paginate(github, `${repoPath}${path}`));
  }

  return {
    async getAppBotLogin(): Promise<string> {
      const { login } = viewerSchema.parse(await github.graphql(viewerQuery, {})).viewer;
      return login.endsWith(botLoginSuffix) ? login : `${login}${botLoginSuffix}`;
    },
    async getPullRequest(number: number) {
      return pullRequestSchema.parse(await request(`/pulls/${number}`));
    },
    async listBaseBlobs(sha: string): Promise<Map<string, string>> {
      const tree = treeSchema.parse(await request(`/git/trees/${sha}?recursive=1`));
      if (tree.truncated) return new Map();
      return new Map(
        tree.tree.filter(entry => entry.type === 'blob').map(entry => [entry.path, entry.sha])
      );
    },
    listFiles(number: number) {
      return listAll(`/pulls/${number}/files`, pullRequestFileSchema);
    },
    listStatuses(sha: string) {
      return listAll(`/commits/${sha}/statuses`, commitStatusSchema);
    },
    listCommitPullRequests(sha: string) {
      return listAll(`/commits/${sha}/pulls`, commitPullRequestSchema);
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
