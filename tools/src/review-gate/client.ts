import { z } from 'zod';

import { type GitHubClient, GitHubError, type HttpMethod, paginate } from '../ci/github.js';
import {
  branchRulesSchema,
  commitPullRequestSchema,
  commitStatusSchema,
  issueCommentSchema,
  permissionSchema,
  pullRequestFileSchema,
  pullRequestSchema,
  reviewSchema,
  teamReviewsSchema,
  treeSchema,
  workflowRunSchema,
} from './schemas.js';

const notFoundStatus = 404;
const pullRequestRuleType = 'pull_request';
const teamReviewerType = 'Team';
const maxReviewPages = 30;
const teamReviewsQuery = `
  query ($owner: String!, $name: String!, $number: Int!, $after: String) {
    repository(owner: $owner, name: $name) {
      pullRequest(number: $number) {
        reviews(first: 100, after: $after) {
          nodes {
            databaseId
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
    async getPullRequest(number: number) {
      return pullRequestSchema.parse(await request(`/pulls/${number}`));
    },
    listOpenPullRequests(base: string) {
      return listAll(
        `/pulls?state=open&base=${encodeURIComponent(base)}&sort=updated&direction=desc`,
        pullRequestSchema
      );
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
    listReviews(number: number) {
      return listAll(`/pulls/${number}/reviews`, reviewSchema);
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
    listComments(number: number) {
      return listAll(`/issues/${number}/comments`, issueCommentSchema);
    },
    async createComment(number: number, body: string): Promise<void> {
      await request(`/issues/${number}/comments`, 'POST', { body });
    },
    async updateComment(id: number, body: string): Promise<void> {
      await request(`/issues/comments/${id}`, 'PATCH', { body });
    },
    async getWorkflowRun(id: string) {
      try {
        return workflowRunSchema.parse(await request(`/actions/runs/${id}`));
      } catch (error) {
        if (error instanceof GitHubError && error.status === notFoundStatus) return null;
        throw error;
      }
    },
    async listRequiredReviewerTeams(branch: string): Promise<Set<number>> {
      const rules = branchRulesSchema.parse(await request(`/rules/branches/${branch}`));
      return new Set(
        rules
          .filter(rule => rule.type === pullRequestRuleType)
          .flatMap(rule => rule.parameters?.required_reviewers ?? [])
          .filter(({ reviewer }) => reviewer.type === teamReviewerType)
          .map(({ reviewer }) => reviewer.id)
      );
    },
    async listTeamReviewIds(number: number, teams: ReadonlySet<number>): Promise<Set<number>> {
      const [owner, name] = repository.split('/');
      const reviewIds = new Set<number>();
      let after: string | null = null;
      for (let page = 1; page <= maxReviewPages; page += 1) {
        const data: unknown = await github.graphql(teamReviewsQuery, {
          owner,
          name,
          number,
          after,
        });
        const { nodes, pageInfo } = teamReviewsSchema.parse(data).repository.pullRequest.reviews;
        for (const review of nodes) {
          const forRequiredTeam = review.onBehalfOf.nodes.some(
            team => team?.databaseId != null && teams.has(team.databaseId)
          );
          if (review.databaseId !== null && forRequiredTeam) reviewIds.add(review.databaseId);
        }
        if (!pageInfo.hasNextPage) break;
        after = pageInfo.endCursor;
      }
      return reviewIds;
    },
    async getPermission(login: string) {
      const parsed = permissionSchema.safeParse(
        await request(`/collaborators/${encodeURIComponent(login)}/permission`)
      );
      return parsed.success ? parsed.data : null;
    },
  };
}
