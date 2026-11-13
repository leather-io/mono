import { z } from 'zod';

import { createGitHubRequestFromEnv } from '../ci/github.js';
import {
  commitPullRequestSchema,
  commitStatusSchema,
  issueCommentSchema,
  permissionSchema,
  pullRequestFileSchema,
  pullRequestSchema,
  reviewSchema,
  treeSchema,
} from './schemas.js';

interface NewStatus {
  readonly state: 'pending' | 'success' | 'failure' | 'error';
  readonly context: string;
  readonly description: string;
  readonly target_url: string;
}

export function createGateClientFromEnv() {
  const { request, requestAllPages } = createGitHubRequestFromEnv();

  async function listAll<T extends z.ZodType>(path: string, schema: T): Promise<z.infer<T>[]> {
    return z.array(schema).parse(await requestAllPages(path));
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
      await request(`/statuses/${sha}`, { method: 'POST', body: status });
    },
    listComments(number: number) {
      return listAll(`/issues/${number}/comments`, issueCommentSchema);
    },
    async createComment(number: number, body: string): Promise<void> {
      await request(`/issues/${number}/comments`, { method: 'POST', body: { body } });
    },
    async updateComment(id: number, body: string): Promise<void> {
      await request(`/issues/comments/${id}`, { method: 'PATCH', body: { body } });
    },
    async getPermission(login: string) {
      const parsed = permissionSchema.safeParse(
        await request(`/collaborators/${encodeURIComponent(login)}/permission`)
      );
      return parsed.success ? parsed.data : null;
    },
  };
}
