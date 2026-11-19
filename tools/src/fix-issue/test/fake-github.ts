import { type GitHubClient, GitHubError, type HttpMethod } from '../../ci/github.js';
import { gitBlobSha } from '../git.js';

interface GitHubCall {
  readonly method: HttpMethod | 'GRAPHQL';
  readonly path: string;
  readonly body: unknown;
}

export type GitHubRoute = (method: HttpMethod, path: string, body: unknown) => unknown;

interface FakeGitHub extends GitHubClient {
  readonly calls: GitHubCall[];
}

function blobSha(body: unknown): string {
  if (
    typeof body !== 'object' ||
    body === null ||
    !('content' in body) ||
    typeof body.content !== 'string'
  ) {
    throw new Error('blob body has no content');
  }
  return gitBlobSha(Buffer.from(body.content, 'base64'));
}

function respond(route: GitHubRoute, method: HttpMethod, path: string, body: unknown): unknown {
  const routed = route(method, path, body);
  if (routed !== undefined) return routed;
  if (method === 'POST' && path.endsWith('/git/blobs')) return { sha: blobSha(body) };
  if (method === 'POST' && path.endsWith('/git/trees')) return { sha: 'new-tree-sha' };
  if (method === 'POST' && path.endsWith('/git/commits')) return { sha: 'new-commit-sha' };
  if (method === 'GET' && path.includes('/git/commits/')) return { tree: { sha: 'base-tree-sha' } };
  if (method === 'GET' && path.includes('/git/matching-refs/')) return [];
  if (method === 'GET' && path.includes('/pulls?')) return [];
  if (path.includes('/git/refs')) return {};
  if (method === 'POST' && path.endsWith('/pulls')) {
    return { number: 101, html_url: 'https://github.com/leather-io/mono/pull/101' };
  }
  if (method === 'GET' && /\/pulls\/\d+$/.test(path)) {
    return { state: 'open', draft: false, commits: 1 };
  }
  if (method === 'PATCH' && path.includes('/pulls/')) return {};
  if (method === 'POST' && path.endsWith('/comments')) {
    return { html_url: 'https://github.com/leather-io/mono/issues/12#issuecomment-1' };
  }
  throw new GitHubError(404, `fake GitHub has no route for ${method} ${path}`);
}

export function fakeGitHub(route: GitHubRoute = () => undefined): FakeGitHub {
  const calls: GitHubCall[] = [];
  return {
    calls,
    request(method, path, body) {
      calls.push({ method, path, body });
      return new Promise(resolve => {
        resolve(respond(route, method, path, body));
      });
    },
    graphql(query, variables) {
      calls.push({ method: 'GRAPHQL', path: query, body: variables });
      return Promise.resolve({});
    },
  };
}
